import { IDirective } from "angular";

/* Directive */
class Directive implements IDirective {
    restrict = 'EA';
}

/** The ode-list-folder directive.
 * 
 * Usage (pseudo-code):
 *      &lt;ode-list-folder>{{$parent.folder.xxx}}</ode-list-folder&gt;
 * where $parent.folder is an IFolder
 */
export function DirectiveFactory() {
	return new Directive();
}
