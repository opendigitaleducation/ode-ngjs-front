import { IAttributes, IController, IDirective, ILocationService, IScope, IWindowService } from "angular";
import { App, ResourceType, IOrder, SORT_ORDER, framework, RESOURCE, ACTION } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
    model?:UiModel;

    constructor( private $location:ILocationService
                ,private $window:IWindowService ) {
    }
    
    async buildContext( app:App, resource:ResourceType ) {
        this.model = new UiModel(app, resource);
        return await this.model.initialize();
    }

    getSortClass( sort:IOrder ) {
        const sortOrders = this.model?.searchParameters.orders;
        if( sortOrders && sortOrders[sort.id]===SORT_ORDER.ASC ) {
            return { active: true }
        }
    }

    toggleSortOrder( sort:IOrder ) {
        const search = this.model?.searchParameters;
        if( search ) {
            search.orders = search.orders || {};
            search.orders[sort.id] = search.orders[sort.id] 
                ? search.orders[sort.id]===SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC
                : sort.defaultValue ? sort.defaultValue : SORT_ORDER.ASC;
        }
    }

    onCreate():void {
        // TODO ajouter une méthode "create" à IExplorerContext, fortement typée plutôt qu'interroger le bus en direct.
        framework.getBus().send(RESOURCE.BLOG, ACTION.CREATE, "test proto").then( res => {
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

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./explorer.directive.html').default;
	scope = {};
	bindToController = true;
	controller = ['$location','$window',Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;

        const app:App = attr["app"] as App;
        if( !app ) throw new Error("App undefined for explorer.");

        const resource:ResourceType = attr["resource"] as ResourceType;
        if( !resource ) throw new Error("Resource undefined for explorer.");
            
        ctrl.buildContext( app, resource ).then( ctx => {
            scope.$apply();
        });
    }
}

/** The ode-explorer directive.
 *
 * Usage:
 * 1) import your directive's factory,
 *      import { Explorer } from 'ode-ngjs-front';
 * 2) Add it to your angular module,
 *      ng.directives.push( ng.directive("odeExplorer", Explorer.DirectiveFactory) );
 * 3) Use it,
 *      &lt;ode-explorer app="blog" resource="blog"></ode-explorer&gt;
 * 
 * 4) TODO unit-testing : https://docs.angularjs.org/guide/unit-testing#testing-a-controller
 */
export function DirectiveFactory() {
	return new Directive();
}
