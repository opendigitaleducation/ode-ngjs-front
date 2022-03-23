import { IAttributes, IController, IDirective, IScope } from "angular";
import { IResource } from "ode-ts-client";
import { ExplorerModel } from "../../../stores/explorer.model";

/* Controller for the directive */
export class Controller implements IController {
    // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
    item:IResource  = null  as unknown as IResource;
    private selected:boolean = false;

    toggleSelect():void {
        this.selected = !this.selected;
        this.model.updateSelection( this.item, this.selected );
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
    replace= true;
	bindToController = true;
	controller = ["odeExplorerModel", Controller];
	controllerAs = 'ctrl';
}

/** The ode-domino-item directive.
 */
export function DirectiveFactory() {
	return new Directive();
}
