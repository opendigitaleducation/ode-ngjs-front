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
    replace= true
	bindToController = true;
	controller = ["odeExplorerModel", Controller];
	controllerAs = 'ctrl';
}

/** The ode-domino-folder directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
