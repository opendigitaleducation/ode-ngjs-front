/* The say-something example directive.
 *
 * Usage:
 * 1) import your directive's factory,
 *      import { Samples } from 'ode-ngjs-front';
 * 2) Add it to your angular module,
 *      ng.directives.push( ng.directive("saySomething", Samples.SaySomething.DirectiveFactory) );
 * 3) Use it,
 *      <say-something what="Hello" ng-model="'World'"></say-something>
 * 
 * 4) TODO unit-testing : https://docs.angularjs.org/guide/unit-testing#testing-a-controller
 */
import { IAttributes, ICompileService, IController, IDirective, IHttpService, IScope } from "angular";

/* Controller for the directive */
export class Controller implements IController {
    constructor(private $http:IHttpService) {
    }
    what?: string;
    userName?: any;

    sayHello():string {
        return `${this.what}, ${this.userName} !`;
    }
}

/* Directive */
export class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';

// The require() will be resolved by webpack at bundle time.
// If this is a ".html" file, it will be inlined as a javascript characters string, and thus must be used like below :
	template = require("./say-something.directive.html").default;
//or
// If it is a ".lazy.html" file, it will be lazy-loade by angularjs at runtime, and thus must be used like below :
//  templateUrl = require('./say-something.directive.lazy.html');

    /* Scope isolation, @see https://code.angularjs.org/1.7.9/docs/guide/directive#isolating-the-scope-of-a-directive */
    scope = {
        what: '@',
        userName: '=ngModel'
    };

    /* 
     * Binding the scope to the controller makes the controller cleaner.
     * @see why at https://ultimatecourses.com/blog/no-scope-soup-bind-to-controller-angularjs
     */
	bindToController = true;

	controller = ["$http", Controller];
	controllerAs = 'ctrl';

    /** @see the link method below. */
	require = ['saySomething','ngModel'];

    /**
     * Link method for the directive.
     * @see https://code.angularjs.org/1.7.9/docs/api/ng/service/$compile
     * @param $scope scope
     * @param $elem jqLite-wrapped element that this directive matches.
     * @param $attr hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
     * @param controllers Array of "require"d controllers : [ngModelCtrl]
     */
    link(scope:IScope, elem:JQLite, attr:IAttributes, controllers:IController[]|undefined): void {
        let ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        let ngModelCtrl:IController|null = controllers ? controllers[1] as IController : null;

        // TODO Manipulate the DOM here with this.$compile()

        console.log( ctrl?.userName );
        console.log( ngModelCtrl );
    }

    /* Constructor with Dependency Injection */
    constructor(private $compile:ICompileService) {
    }
}

/** Directive factory, with dependencies injected as required by $inject below. */
export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];
