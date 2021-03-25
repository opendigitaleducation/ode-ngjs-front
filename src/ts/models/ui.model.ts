import { App, framework, IContext, IExplorerContext, IFolder, IResource, ISearchParameters, ResourceType } from "ode-ts-client";

export class UiModel {
    explorer:IExplorerContext;
    context?:IContext;

    constructor( private app:App, private resource:ResourceType ) {
        this.explorer = framework.createContext( [resource], app );
    }

    async initialize() {
        this.context = await this.explorer.initialize();

        return this.context;
    }

    async clear() {

    }

    get searchParameters():ISearchParameters {
        return this.explorer.getSearchParameters();
    }

    loadedFolders:IFolder[] = [];
    loadedItems:IResource[] = [];

    selectedFolders:IFolder[] = [];
    selectedItems:IResource[] = [];


}