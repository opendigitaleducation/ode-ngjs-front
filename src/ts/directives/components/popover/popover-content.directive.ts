import { IAttributes, IController, IDirective, IScope } from "angular";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	require= '^popover';
	restrict= 'E';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		elem.addClass("d-none");
	}
}

/** The popover-content directive.
 *
 * Usage:
 *      &lt;popover>&lt;button popover-opener/>&lt;popover-content>&lt;/popover-content></popover&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}