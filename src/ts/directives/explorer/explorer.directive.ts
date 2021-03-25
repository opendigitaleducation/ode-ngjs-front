import { IAttributes, IController, IDirective, IScope } from "angular";
import { App, IExplorerContext, framework, ResourceType, IContext, IOrder, ISearchParameters, SORT_ORDER } from "ode-ts-client";

/* Controller for the directive */
export class Controller implements IController {
    app?:App;
    resource?:ResourceType;
    
    explorer:IExplorerContext|null = null;
    context:IContext|null = null;

    build():Controller {
        if( !this.app )
            throw new Error("App undefined for explorer.");
        if( !this.resource )
            throw new Error("Resource undefined for explorer.");
        this.explorer = framework.createContext( [this.resource], this.app );
        return this;
    }

    async initialize() {
        if( this.explorer ) {
            return this.context = await this.explorer.initialize();
        }
    }

    getSortClass( sort:IOrder ) {
        const search = this.explorer?.getSearchParameters();
        if( search?.orders && search.orders[sort.id]===SORT_ORDER.ASC ) {
            return { active: true }
        }
    }

    toggleSortOrder( sort:IOrder ) {
        // if( this.explorer ) {
        //     const search = this.explorer.getSearchParameters();
        //     if( !search.orders ) {
        //         search.orders = [];
        //     }
        //     let s = search.orders.find( (s) => s.id===sort.id );
        //     if( s ) {
        //         // Toggle order
        //         s.defaultValue = s.defaultValue==="asc" ? "desc" : "asc";
        //     } else {
        //         // New default sort order
        //         s = Object.assign({}, sort);
        //         if( !s.defaultValue ) {
        //             s.defaultValue = "asc";
        //         }
        //     }
        //     search.orders = [s];
        //}
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./explorer.directive.html').default;
	scope = {
        app:'@', resource:'@'
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;
        ctrl.build().initialize().then( (ctx) => {
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
