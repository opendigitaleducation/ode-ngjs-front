import { IController, IDirective } from "angular";
import { IFolder } from "ode-ts-client";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {}
    folders?: IFolder[];
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {
        folders: "="
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The explorer directive.
 *
 * Usage:
 *      &lt;ode-sidebar folders="folderArray"></ode-sidebar&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
