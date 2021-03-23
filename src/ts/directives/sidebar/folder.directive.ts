import { IController, IDirective } from "angular";
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
	scope = {
        folder:"=odeFolder"
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The folder directive.
 * 
 * Usage:
 *      &lt;ode-folder folder="folder"></ode-folder&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
