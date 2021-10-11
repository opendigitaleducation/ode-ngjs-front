import { IAttributes, IController, IDirective, IScope } from "angular";

/* Controller for the directive */
export class Controller implements IController {
    name = "default";
	attach?: (element:JQLite)=>void;
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	controller = [Controller];
	require = ["odeModalContainer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		// Set the container's name, if defined
		if( typeof attrs["odeModalContainer"]==="string" && attrs["odeModalContainer"].trim().length>0 ) {
			ctrl.name = attrs["odeModalContainer"];
		}

		ctrl.attach = (modal:JQLite) => {
			if( elem && modal ) {
				elem.append( modal );
			}
		}
	}
}

/** 
 * The modal-container directive.
 * The ode-modal-container directive allow hosting ode-modals anywhere in the DOM.
 * It will contain (from the DOM point of view) every ode-modals which target it by its name.
 *
 * Usage:
 *      &lt;div ode-modal-container="itsName"></div&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
