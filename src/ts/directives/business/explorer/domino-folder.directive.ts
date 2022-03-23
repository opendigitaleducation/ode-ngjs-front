import { IAttributes, IController, IDirective, IScope } from "angular";
import { IFolder } from "ode-ts-client";
import { ExplorerModel } from "../../../stores/explorer.model";

/* Controller for the directive */
export class Controller implements IController {
    constructor( 
        public model:ExplorerModel
        ) {
    }
    // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
    folder:IFolder = null as unknown as IFolder;
    private selected:boolean = false;

    toggleSelect():void {
        this.selected = !this.selected;
        this.model.updateSelection( this.folder, this.selected );
    }

    openSubfolder():void {
		this.model.openFolder( this.folder );
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./domino-folder.directive.html').default;
	scope = {
        folder:"="
    };
    replace = true
	bindToController = true;
	controller = ["odeExplorerModel", Controller];
	controllerAs = 'ctrl';
}

/** The ode-domino-folder directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
