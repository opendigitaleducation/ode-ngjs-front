import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { NotifyService } from "../../services";

/* Controller for the directive */
export class Controller implements IController {
    constructor(private notify:NotifyService) {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require("./rename-me.directive.html").default;
//  templateUrl = require('./rename-me.directive.lazy.html').default;
    scope = {
    };
	bindToController = true;
	controller = ["odeNotify", Controller];
	controllerAs = 'ctrl';
	require = ['odeRenameMe'];

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
        // TODO Manipulate the DOM here with this.$compile()
    }

    /* Constructor with Dependency Injection */
    constructor(private $compile:ICompileService) {
    }
}

/**
 * The renameMe directive.
 *
 * Usage:
 *   &lt;rename-me ></rename-me&gt;
 */
export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];
