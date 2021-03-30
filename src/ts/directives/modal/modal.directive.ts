import { IController, IDirective } from "angular";

/* Controller for the directive */
export class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
		this.id = null as unknown as string;
		this.visible = null as unknown as boolean;
		this.onCancel = null as unknown as Function;
		this.onValidate = null as unknown as Function;
	}
	id:string;
	visible:boolean;
	onCancel:Function;
	onValidate:Function;

	getClass() {
		return {show:this.visible};
	}
	getStyle() {
		return {
			 display: this.visible ? 'block' : 'none'
			,"background-color": 'transparent'
		};
	}
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./modal.directive.html').default;
	scope = {
		id:"@",
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
 *      &lt;ode-modal context="instance of IExplorerContext" ></ode-modal&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
