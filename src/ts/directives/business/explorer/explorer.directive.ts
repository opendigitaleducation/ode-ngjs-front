import { IAttributes, IController, IDirective, ILocationService, IRootScopeService, IScope, IWindowService } from "angular";
import { App, ResourceType, IOrder, SORT_ORDER, RESOURCE, ACTION, ExplorerFrameworkFactory, IFolder, IFilter, BOOLEAN_FILTER, BooleanFilterType } from "ode-ts-client";
import { ExplorerModel, FOLDER_ID } from "../../../stores/explorer.model";

/* Controller for the directive */
export class Controller implements IController {
    // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
    private app:App = null as unknown as App;
    private resource:ResourceType = null as unknown as ResourceType;

    constructor(
        private $location:ILocationService,
        private $window:IWindowService,
        public $rootScope:IRootScopeService,
        public model:ExplorerModel
    ){}

    filterType:{[filter in BooleanFilterType]?: string} = {};
    getFilterIcon(filter:BooleanFilterType): string {
        switch(filter) {
            case "owner":   return "ic-user";
            case "shared":  return "ic-share";
            case "public":  return "ic-public";
            case "favorite":return "ic-favorite";
            default:        return "";
        }
    }
    getFilterI18n(filter:BooleanFilterType): string {
        switch(filter) {
            case "owner":   return "explorer.filter.owner";
            case "shared":  return "explorer.filter.shared";
            case "public":  return "explorer.filter.public";
            case "favorite":return "explorer.filter.favorite";
            default:        return "";
        }
    }

    $onInit() {
        if( !this.app ) throw new Error("App undefined for explorer.");
        if( !this.resource ) throw new Error("Resource undefined for explorer.");

        // Explorer has 2 folders by default :
        const defaultFolder:IFolder = {
            id: FOLDER_ID.DEFAULT,
            assetId: FOLDER_ID.DEFAULT,
            name: "Mes blogs", // TODO appliquer une clé de trad, en fonction du type de ressource stocké dans ce dossier.
            childNumber: 0, // will be adjusted below
            type: "default"
        };
        const binFolder:IFolder = {
            id: FOLDER_ID.BIN,
            assetId: FOLDER_ID.BIN,
            name: "Corbeille", // TODO appliquer une clé de trad.
            childNumber: 0,
            type: "bin"
        };

        this.model.indexFolder( defaultFolder );
        this.model.indexFolder( binFolder );

        this.model.initialize( this.app, this.resource )
        .then( ctx => {
            // Filters
            for( let filter of ctx.filters ) {
                switch( typeof filter.defaultValue ) {
                    case "string":
                        this.filterType[filter.id] = "text";
                        // @ts-ignore this.model.searchParameters is defined now
                        this.model.searchParameters.filters[filter.id] = filter.defaultValue as string;
                        break;
                    case "boolean": 
                        this.filterType[filter.id] = "checkbox";
                        // @ts-ignore this.model.searchParameters is defined now
                        this.model.searchParameters.filters[filter.id] = filter.defaultValue as boolean;
                        break;
                    default:
                        break;;
                }
            }

            // list content
            const defaultModel = this.model.getFolderModel( FOLDER_ID.DEFAULT );
            defaultModel.folder.childNumber = ctx.folders.length;
            ctx.folders.forEach( f => {
                this.model.indexFolder( f, FOLDER_ID.DEFAULT );
                defaultModel.subfolders.push(f.id);
            });
            this.model.currentFolder = defaultModel;
            this.$rootScope.$apply();
        });
    }
    
    getSortClass( sort:IOrder ) {
        const sortOrders = this.model.searchParameters?.orders;
        if( sortOrders && sortOrders[sort.id]===SORT_ORDER.ASC ) {
            return { active: true }
        }
    }

    toggleSortOrder( sort:IOrder ) {
        const search = this.model.searchParameters;
        if( search ) {
            search.orders = search.orders || {};
            search.orders[sort.id] = search.orders[sort.id] 
                ? search.orders[sort.id]===SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC
                : sort.defaultValue ? sort.defaultValue : SORT_ORDER.ASC;
        }
    }

    onSearchTermChanged( e:KeyboardEvent ) {
        const search = this.model.searchParameters;
        if( search ) {
            search.pagination.startIdx = 0;
            if( e && e.code == "Enter" ) {
                if( search.search?.length===0 ) {
                    delete search.search;
                }
                this.model.searchAgain();
            }
        }
    }

    onCreate() {
        if( this.model.explorer && this.model.resourceType ) {
            this.model.explorer?.create( this.model.resourceType );
            // TODO Is the above call an exit point to the legacy app ?
        }
    }
}

type Scope = IScope & {
    app:App;
    resource:ResourceType;
}

/* Directive */
class Directive implements IDirective<Scope> {
    restrict = "E";
	template = require('./explorer.directive.html').default;
	scope = {
        app:"@",
        resource:"@"
    };
	bindToController = true;
	controller = ["$location","$window","$rootScope","odeExplorerModel",Controller];
	controllerAs = "ctrl";

    async link(scope:Scope, elem:JQLite, attr:IAttributes, controller:IController|undefined) {
        const ctrl:Controller = controller as Controller;
        if( !ctrl.model ) throw new Error("Data model undefined for explorer.");
    }
}

/** The ode-explorer directive.
 *
 * TODO unit-testing : https://docs.angularjs.org/guide/unit-testing#testing-a-controller
 */
export function DirectiveFactory() {
	return new Directive();
}