import { IAttributes, IController, IDirective, IScope } from "angular";
import { App, IExplorerFramework, IExplorerContext, framework, ResourceType, IContext } from "ode-ts-client";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {}
    app?:App;
    resource?:ResourceType;
    explorer:IExplorerContext|null = null;
    context:IContext|null = null;

    build() {
        if( !this.app )
            throw new Error("App undefined for folder-explorer.");
        if( !this.resource )
            throw new Error("Resource undefined for folder-explorer.");
        this.explorer = framework.createContext( [this.resource], this.app );
    }

    async initialize() {
        if( this.explorer ) {
            this.context = await this.explorer.initialize();
        }
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./folder-explorer.directive.html').default;
	scope = {
        app:'@', resource:'@'
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;
        ctrl.build();
        ctrl.initialize();
    }

    /* Dependency Injection */
    static $inject = [];
    constructor() {
    }
}

/** The folder-explorer directive.
 *
 * Usage:
 * 1) import your directive's factory,
 *      import { FolderExplorer } from 'ode-ngjs-front';
 * 2) Add it to your angular module,
 *      ng.directives.push( ng.directive("FolderExplorer", FolderExplorer.DirectiveFactory) );
 * 3) Use it,
 *      &lt;folder-explorer app="blog" resource="blog"></folder-explorer&gt;
 * 
 * 4) TODO unit-testing : https://docs.angularjs.org/guide/unit-testing#testing-a-controller
 */
export function DirectiveFactory() {
	return new Directive();
}
