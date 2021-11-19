import { IAttributes, IController, IDirective, IScope } from "angular";
import { L10n } from "../../..";
import { Controller as ModalContainerController } from "./modal-container.directive"

type ModalSize = "sm"|"md"|"lg"|"xl";

/* Controller for the directive */
export class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
		this.id = null as unknown as string;
	}
	id:string;
	size:ModalSize = "md";
	container:string = "default";
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
		container: "=?",
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
	require=['odeModal', '?^^odeModalContainer'];

	link(scope:IScope, element:JQLite, attributes:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const containerCtrl:ModalContainerController = controllers[1] as ModalContainerController;

		if( containerCtrl && containerCtrl.attach && containerCtrl.name===ctrl.container ) {
			// Attach the modal to its container
			containerCtrl.attach( element );
		}

		if( typeof attributes['id'] === "undefined" || (attributes['id'] as string).length === 0 ) {
			ctrl.id = L10n.moment(new Date()).format("YYMMDDHHMMssSSS") + (1000*Math.random()).toFixed(0);
		}
	}
}

/** 
 * The ode-modal directive.
 * See also {@link ModalContainerController }
 *
 * Usage:
 *      &lt;ode-modal size?="sm|lg|xl" container?="name_of_a_modal_container" visible="a_boolean_variable" on-close?="a_function">
 *        &lt;ode-modal-title>Your HTML title here</ode-modal-title>
 *        &lt;ode-modal-body>Your HTML content here</ode-modal-body>
 *        &lt;ode-modal-footer>Your HTML footer here</ode-modal-footer>
 * 		</ode-modal&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
