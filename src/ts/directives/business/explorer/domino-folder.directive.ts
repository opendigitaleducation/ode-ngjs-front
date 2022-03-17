import * as Explorer from './explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { IFolder } from "ode-ts-client";
import { SearchStore } from "../../../stores/search.store";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as SearchStore;
        this.folder = null  as unknown as IFolder;
    }
    model: SearchStore;
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

    openSubfolder():void {
		this.model.openAsSubfolder( this.folder );
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./domino-folder.directive.html').default;
	scope = {
        folder:"="
    };
    replace= true
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ["odeDominoFolder", "^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
        const ctrl:Controller = controllers[0] as Controller;
        const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
        ctrl.model = odeExplorer.model;
    }
}

/** The ode-domino-folder directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
