import { IAttributes, IController, IDirective, IParseService, IScope } from "angular";
import { IFolder } from "ode-ts-client";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {}
    folder?:IFolder;
    subfolders:IFolder[] = [];

    hasChildren():boolean {
        return (typeof this.folder==="object") && this.folder.childNumber > 0;
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'A';
	templateUrl = require('./folder.directive.lazy.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
    $parse:IParseService;

    link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;
        ctrl.folder = this.$parse(attr.folder)(scope);
    }

    /* Dependency Injection */
    static $inject = ["$parse"];
    constructor($parse:IParseService) {
        this.$parse = $parse;
    }
}

/** The folder directive.
 */
export function DirectiveFactory($parse:IParseService) {
	return new Directive($parse);
}
