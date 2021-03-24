import { IDirective } from "angular";

/* Directive */
class Directive implements IDirective {
    restrict = 'EA';
}

/** The ode-list-item directive.
 * 
 * Usage (pseudo-code):
 *      &lt;ode-list-item>{{$parent.item.xxx}}</ode-list-item&gt;
 * where $parent.item is an IResource
 */
 export function DirectiveFactory() {
	return new Directive();
}
