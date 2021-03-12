/* The folder-explorer directive.
 *
 * Usage:
 * 1) import your directive's factory,
 *      import { FolderExplorer } from 'ode-ngjs-front';
 * 2) Add it to your angular module,
 *      ng.directives.push( ng.directive("FolderExplorer", FolderExplorer.DirectiveFactory) );
 * 3) Use it,
 *      <folder-explorer app="blog"></folder-explorer>
 * 
 * 4) TODO unit-testing : https://docs.angularjs.org/guide/unit-testing#testing-a-controller
 */
import { IAttributes, ICompileService, IController, IDirective, IHttpService, IScope } from "angular";

/* Controller for the directive */
export class Controller implements IController {
    constructor($http:IHttpService) {
        this.$http = $http;
    }
    $http:IHttpService;
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./folder-explorer.directive.html');

    /* Scope isolation, @see https://code.angularjs.org/1.7.9/docs/guide/directive#isolating-the-scope-of-a-directive */
	scope = {};

    /* 
     * Binding the scope to the controller makes the controller cleaner.
     * @see why at https://ultimatecourses.com/blog/no-scope-soup-bind-to-controller-angularjs
     */
	bindToController = true;

	controller = ["$http", Controller];
	controllerAs = 'ctrl';

    /* Dependency Injection */
    static $inject = [];
    constructor() {
    }
}

/** Directive factory, with dependencies injected as required by $inject above. */
export function DirectiveFactory() {
	return new Directive();
}
