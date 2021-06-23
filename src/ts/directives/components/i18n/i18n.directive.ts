import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { I18nBase } from "./I18nBase";

/* Directive */
class Directive extends I18nBase implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict='E';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        elem.html( this.$compile('<span class="no-style">'+ this.idiom.translate(elem.text().trim()) +'</span>')(scope).text() );
    }
}

/** The i18n directive.
 *
 * Usage:
 *      &lt;i18n>your.i18n.key</i18n&gt;
 */
 export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];