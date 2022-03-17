import { App, ExplorerFrameworkFactory, GetResourcesResult, IContext, IExplorerContext, IFolder, IResource, ISearchParameters, ResourceType } from "ode-ts-client";

export class SearchStore {
    app:App;
    resourceType:ResourceType;
    explorer:IExplorerContext;
    context?:IContext;

    constructor( app:App, resourceType:ResourceType ) {
        this.app = app;
        this.resourceType = resourceType;
        this.explorer = ExplorerFrameworkFactory.instance().createContext( [resourceType], app );
    }

    async initialize() {
        this.context = await this.explorer.initialize();
        return this.context;
    }

    get searchParameters():ISearchParameters {
        return this.explorer.getSearchParameters();
    }

    loadedFolders:IFolder[] = [];
    loadedItems:IResource[] = [];

    selectedFolders:IFolder[] = [];
    selectedItems:IResource[] = [];

    get currentFolder():IFolder|undefined {
        if( this.breadcrumb.length > 0 )
            return this.breadcrumb[this.breadcrumb.length-1];
    }

    openAsSubfolder( f:IFolder ):Promise<GetResourcesResult> {
        this.searchParameters.filters.folder = f.id;
        return this.explorer.getResources().then( r=>{
            this.breadcrumb.push( f );
            return r;
        });
    }

    //---- Breadcrumb utilities
    breadcrumb:IFolder[] = [];

}