import { IController, IDirective } from "angular";

type ModalSize = "sm"|"lg"|"xl";

/* Controller for the directive */
export class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
		this.id = null as unknown as string;
		this.onValidate = null as unknown as Function;
		this.size = null;
	}
	id:string;
	size:ModalSize|null;
	visible?:boolean;
	onClose?:Function;
	onValidate:Function;

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
class Directive implements IDirective {
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
		title:	"odeModalTitle",
        body:   "odeModalBody",
        footer: "odeModalFooter"
    };
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The ode-modal directive.
 *
 * Usage:
 *      &lt;ode-modal size?="sm|lg|xl">
 *        &lt;ode-modal-title>Your HTML title here</ode-modal-title>
 *        &lt;ode-modal-body>Your HTML content here</ode-modal-body>
 *        &lt;ode-modal-footer>Your HTML footer here</ode-modal-footer>
 * 		</ode-modal&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
