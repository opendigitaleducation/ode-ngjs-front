import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { I18nBase } from "./I18nBase";

/* Directive */
class Directive extends I18nBase implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict='E';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const key = elem.text().trim();
        const value = this.idiom.translate(key);
        // Set the inner HTML of elem with compiled html() code, not compiled text().
        // The html code may contain other angular directives, or HTML tags.
        elem.html( this.$compile('<span class="no-style">'+ value +'</span>')(scope).html() );
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