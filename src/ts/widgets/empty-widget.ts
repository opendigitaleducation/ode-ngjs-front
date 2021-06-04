import { IDirective } from "angular";

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = "<span>widget is loading</span>";
}

/** The empty widget. */
export function DirectiveFactory() {
	return new Directive();
}