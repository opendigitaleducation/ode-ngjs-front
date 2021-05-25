import { IAttributes, IController, IDirective, IScope } from "angular";

export class PulsarController implements IController {
    constructor() {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	controller= [PulsarController];
	restrict= 'E';
    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		elem.on('close', () => {
			if(attrs.onClose){
				scope.$eval(attrs.onClose);
			}
		});
	}
}

/** The popover directive.
 *
 * Usage:
 *      &lt;popover>&lt;button popover-opener/>&lt;popover-content>&lt;/popover-content></popover&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}