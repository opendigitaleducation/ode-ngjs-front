import { IAttributes, IController, IDirective, IScope } from "angular";
import { L10n } from "../../..";

type ModalSize = "sm"|"md"|"lg"|"xl";

/* Controller for the directive */
export class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
		this.id = null as unknown as string;
	}
	id:string;
	size:ModalSize = "md";
	visible?:boolean;
	onClose?:Function;

	getStyle() {
		return {
			 "display": this.visible ? 'block' : 'none'
			,"background-color": 'transparent'
		};
	}
	getSizeClass() {
		switch( this.size ) {
			case "sm": return "modal-sm";
			case "lg": return "modal-lg";
			case "xl": return "modal-xl";
			default: return "";
		}
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./modal.directive.html').default;
	scope = {
		id:"@",
		size: "@?",
		visible:"=?",
		onClose:"&?"
	};
	bindToController = true;
    transclude = {
		title:	"?odeModalTitle",
        body:   "odeModalBody",
        footer: "?odeModalFooter"
    };
	controller = [Controller];
	controllerAs = 'ctrl';
	require=['odeModal'];

	link(scope:IScope, element:JQLite, attributes:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;

		if( typeof attributes['id'] === "undefined" || (attributes['id'] as string).length === 0 ) {
			ctrl.id = L10n.moment(new Date()).format("YYMMDDHHMMssSSS") + (1000*Math.random()).toFixed(0);
		}
	}
}

/** The ode-modal directive.
 *
 * Usage:
 *      &lt;ode-modal size?="sm|lg|xl" visible="a_boolean_variable" on-close?="a_function">
 *        &lt;ode-modal-title>Your HTML title here</ode-modal-title>
 *        &lt;ode-modal-body>Your HTML content here</ode-modal-body>
 *        &lt;ode-modal-footer>Your HTML footer here</ode-modal-footer>
 * 		</ode-modal&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
