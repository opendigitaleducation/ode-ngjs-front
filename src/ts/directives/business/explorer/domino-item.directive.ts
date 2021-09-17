import * as Explorer from './explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { IResource } from "ode-ts-client";
import { UiModel } from "../../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;
        this.item = null  as unknown as IResource;
    }
    model:UiModel;
    item:IResource;
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
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./domino-item.directive.html').default;
	scope = {
        item:"="
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ["odeDominoItem", "^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
        const ctrl:Controller = controllers[0] as Controller;
        const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
        ctrl.model = odeExplorer.model;
    }

}

/** The ode-domino-item directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
