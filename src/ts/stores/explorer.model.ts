import { App, ExplorerFrameworkFactory, GetResourcesResult, IContext, ID, IExplorerContext, IFolder, IResource, ISearchParameters, ResourceType } from "ode-ts-client";

export type FolderModel = {
    folder: IFolder;
    ancestors: ID[];
    subfolders: ID[];
}

type FolderIndex = {
    [id:string]: FolderModel;
}

/**
 * Explorer business engine
 */
export class ExplorerModel {
    app?:App;
    resourceType?:ResourceType;
    /** Contains methods to navigate through folders and resources. */
    explorer?:IExplorerContext;
    /** Contains all filter values, sort orders, allowed actions... */
    context?:IContext;

    get searchParameters():ISearchParameters|undefined {
        return this.explorer?.getSearchParameters();
    }

    public currentFolder?:FolderModel;

    displayedFolders:IFolder[] = [];
    displayedItems:IResource[] = [];
    
    selectedFolders:IFolder[] = [];
    selectedItems:IResource[] = [];

    // In-memory folder tree
    private index:FolderIndex = {};


    async initialize( app:App, resourceType:ResourceType ) {
        this.app = app;
        this.resourceType = resourceType;
        this.explorer = ExplorerFrameworkFactory.instance().createContext( [resourceType], app );

        const subscription = this.explorer.latestResources().subscribe({
            next: resultset => { 
                // If pagination starts at 0, this is a new resultset.
                if( resultset.output.pagination.startIdx===0) {
                    this.displayedFolders = resultset.output.folders ?? [];
                    this.displayedItems   = resultset.output.resources ?? [];
                } else {
                    this.displayedItems.concat( resultset.output.resources );
                }
                document.dispatchEvent( new CustomEvent("explorer.view.updated") );
            }
        });

        this.context = await this.explorer.initialize();

        return this.context;
    }

    requestUpdate() {
        document.dispatchEvent( new CustomEvent("explorer.view.updated") );
    }

    getFolderModel( id:ID ) {
        return this.index[id];
    }

    /** Add a folder to the index tree. */
    indexFolder( f:IFolder, parentId?:ID ) {
        if( typeof this.index[f.id] !== "object" ) {
            this.index[f.id] = {
                folder: f,
                ancestors: [],
                subfolders: []
            }
            if( parentId && this.index[parentId] ) {
                const parent = this.getFolderModel(parentId);
                this.index[f.id].ancestors.push( parent.folder.id, ...parent.ancestors );
                // If f is a new folder and the currently displayed folder is its parent.
                if( this.currentFolder===parent && parent.subfolders.indexOf(f.id)<0) {
                    // Then update current folder content
                    parent.subfolders.push( f.id );
                    this.displayedFolders.push( f );
                    this.requestUpdate();
                }
            }
        }
    }

    unindexFolder( folderId:ID ) {
        const folder = this.index[folderId];
        if( typeof folder === "object" ) {
            delete this.index[folderId];
            folder.subfolders.forEach( sf => this.unindexFolder(sf) );
        }
    }

    /** Load a folder content, and set it as current folder. */
    openFolder( f?:IFolder ) {
        if( !f ) return Promise.reject('Unknown folder');
        if( f === this.currentFolder?.folder ) return Promise.resolve();

        if( this.explorer && this.searchParameters ) {
            if( f.id!=='default' ) {
                this.searchParameters.filters.folder = f.id;
            } else {
                delete this.searchParameters.filters.folder;
            }
            this.currentFolder = this.getFolderModel( f.id );
            return this.explorer?.getResources()
            .then( r=>{
                r.folders.forEach( folder => this.indexFolder(folder, f.id) );
            });
        } else {
            throw "Search context not initialized";
        }
    }

    /** Create a new folder in the current folder. */
    createFolder( name:string ) {
        if( !this.explorer || !this.resourceType ) return Promise.reject();
        const parentFolderId = this.currentFolder?.folder.id || 'default';
        return this.explorer.createFolder( this.resourceType, parentFolderId, name )
        .then( r => {
            this.indexFolder( r, parentFolderId );
            return r;
        })
    }

    updateSelection<T extends IFolder|IResource>( o:T, select:boolean ) {
        // @ts-ignore we manually check the typeof 1st parameter.
        const selections:Array<T> = (typeof o.childNumber==='number') ? this.selectedFolders : this.selectedItems;

        const idx = selections.findIndex(f => f.id===o.id );
        if( select && idx < 0 ) {
            // Select it.
            selections.push( o );
            this.requestUpdate();
        } else if( !select && idx >= 0 ) {
            // De-select it.
            selections.splice(idx,1);
            this.requestUpdate();
        }
    }

    /** Delete selected folders and/or resources. */
    deleteSelection() {
        this.explorer?.delete( this.selectedItems.map(i=>i.id), this.selectedFolders.map(i=>i.id) ).then( () => {
            // Remove displayed items
            this.selectedItems.forEach( i => {
                const idx = this.displayedItems.indexOf(i);
                if( idx ) {
                    this.displayedItems.splice( idx, 1 );
                }
            });

            if( this.currentFolder ) {
                // Update item number in this folder
                this.currentFolder.folder.childNumber -= this.selectedItems.length;
                if( this.currentFolder.folder.childNumber < 0 )
                    this.currentFolder.folder.childNumber = 0;
            }

            // Remove indexed folders
            this.selectedFolders.forEach( f => this.unindexFolder(f.id) );

            // Update view
            this.requestUpdate();
        });
    }

}