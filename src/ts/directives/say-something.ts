/* The say-something directive.
 *
 * Usage:
 * <say-something ngModel="ODE"></say-something>
 */

/* Controller for the directive */
class Controller {
    userName: any;
    sayHello():string {
        return `Hello, ${this.userName} !`
    }
}

/* Directive */
class Directive {
    restrict	= 'E';
	template	= `<span>{{ctrl.sayHello()}}</span>`;
//or
//  templateUrl = '';

    /* Scope isolation, @see https://code.angularjs.org/1.7.9/docs/guide/directive#isolating-the-scope-of-a-directive */
	scope = {};

    /* 
     * Binding the scope to the controller makes the controller cleaner.
     * @see why at https://ultimatecourses.com/blog/no-scope-soup-bind-to-controller-angularjs
     */
	bindToController = {
        userName: '@ngModel'
	};

	controller  = [Controller];
	controllerAs= 'ctrl';

//	require = ['saySomething','ngModel'];

    /**
     * Link method for the directive.
     * @see https://code.angularjs.org/1.7.9/docs/api/ng/service/$compile
     * @param $scope scope
     * @param $elem jqLite-wrapped element that this directive matches.
     * @param $attr hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
     * @param controllers Array of "require"d controllers : [ngModelCtrl]
     */
    link($scope:angular.IScope, $elem:JQLite, $attr:angular.IAttributes, controllers:angular.IController[]) { 
        
    }

    $compile:angular.ICompileService;

    /* Constructor with Dependency Injection */
    static $inject = ["$compile"];
    constructor($compile:angular.ICompileService) {
        this.$compile = $compile;
    }
}

/** Directive factory */
export default ($compile:angular.ICompileService) => {
	return new Directive($compile);
}
