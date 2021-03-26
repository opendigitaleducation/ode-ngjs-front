import { IAttributes, IController, IDirective, IScope } from "angular";
import { IOrder, IFolder } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;
        this.folder = null  as unknown as IFolder;
    }
    model: UiModel;
    folder:IFolder;
    private selected:boolean = false;

    toggleSelect( selected?:boolean ):void {
        const idx = this.model.selectedFolders.findIndex(f => f.id===this.folder.id);
        if( idx===-1 || selected===true ) {
            // Select it if needed.
            if( !this.selected ) {
                this.model.selectedFolders.push( this.folder );
                this.selected = true;
            }
        } else {
            // De-select it, if needed.
            if( idx>=0 ) {
                this.model.selectedFolders.splice(idx,1);
                this.selected = false;
            }
        }
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./domino-folder.directive.html').default;
	scope = {
        model:"=",
        folder:"="
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;
    }
}

/** The ode-domino-folder directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
