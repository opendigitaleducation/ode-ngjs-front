import { IAttributes, IController, IDirective, ILocationService, IRootScopeService, IScope, IWindowService } from "angular";
import { App, ResourceType, IOrder, SORT_ORDER, RESOURCE, ACTION, ExplorerFrameworkFactory, IFolder } from "ode-ts-client";
import { ExplorerModel } from "../../../stores/explorer.model";

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

    $onInit() {
        if( !this.app ) throw new Error("App undefined for explorer.");
        if( !this.resource ) throw new Error("Resource undefined for explorer.");

        // Explorer has 2 folders by default :
        const defaultFolder:IFolder = {
            id: "default",
            name: "Mes blogs", // TODO appliquer une clé de trad, en fonction du type de ressource stocké dans ce dossier.
            childNumber: 0, // will be adjusted below
            type: "default"
        };
        const binFolder:IFolder = {
            id: "bin",
            name: "Corbeille", // TODO appliquer une clé de trad.
            childNumber: 0,
            type: "bin"
        };

        this.model.indexFolder( defaultFolder );
        this.model.indexFolder( binFolder );

        this.model.initialize( this.app, this.resource )
        .then( ctx => {
            const defaultModel = this.model.getFolderModel('default');
            defaultModel.folder.childNumber = ctx.folders.length;
            ctx.folders.forEach( f => {
                this.model.indexFolder( f, 'default' );
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

    onCreate():void {
        // TODO ajouter une méthode "create" à IExplorerContext, fortement typée plutôt qu'interroger le bus en direct.
        ExplorerFrameworkFactory.instance().getBus().publish(RESOURCE.BLOG, ACTION.CREATE, "test proto").then( res => {
            if( typeof res === "string" ) {
                if( res.indexOf("#") < 0 ) {
                    // Angular-based routing
                    this.$location.path(res);
                } else {
                    // Browser-based routing
                    this.$window.location.href = res;
                }
            }
        });
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