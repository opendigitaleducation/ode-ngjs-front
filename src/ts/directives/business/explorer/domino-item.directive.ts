import { IAttributes, IController, IDirective, IScope } from "angular";
import { IResource } from "ode-ts-client";
import { ExplorerModel } from "../../../stores/explorer.model";

/* Controller for the directive */
export class Controller implements IController {
    // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
    item:IResource  = null  as unknown as IResource;
    private selected:boolean = false;

    toggleSelect( selected?:boolean ):void {
        const idx = this.model.selectedItems.findIndex(f => f.id===this.item.id);
        if( idx===-1 || selected===true ) {
            // Select it.
            if( !this.selected ) {
                this.model.selectedItems.push( this.item );
                this.selected = true;
            }
        } else {
            // De-select it.
            if( idx>=0 ) {
                this.model.selectedItems.splice(idx,1);
                this.selected = false;
            }
        }
    }

    constructor( public model:ExplorerModel ) {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./domino-item.directive.html').default;
	scope = {
        item:"="
    };
	bindToController = true;
	controller = ["odeExplorerModel", Controller];
	controllerAs = 'ctrl';
}

/** The ode-domino-item directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
