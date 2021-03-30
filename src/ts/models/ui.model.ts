import { App, framework, IContext, IExplorerContext, IFolder, IResource, ISearchParameters, ResourceType } from "ode-ts-client";

export class UiModel {
    app:App;
    resourceType:ResourceType;
    explorer:IExplorerContext;
    context?:IContext;

    constructor( app:App, resourceType:ResourceType ) {
        this.app = app;
        this.resourceType = resourceType;
        this.explorer = framework.createContext( [resourceType], app );
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

    breadcrumb:IFolder[] = [];

    get currentFolder():IFolder|undefined {
        if( this.breadcrumb.length > 0 )
            return this.breadcrumb[this.breadcrumb.length-1];
    }
}