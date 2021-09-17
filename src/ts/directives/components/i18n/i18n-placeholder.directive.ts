import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { I18nBase } from "./I18nBase";

/* Directive */
class Directive extends I18nBase implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        attrs.$observe('i18nPlaceholder', val => {
            const compiled = this.$compile('<span>' + this.idiom.translate(attrs.i18nPlaceholder) + '</span>')(scope);
            setTimeout(function(){
                elem.attr('placeholder', compiled.text()); // Use compiled text(), not html() because attributes should not contain html tags
            }, 10);
        });
    }
}

/** The i18n-placeholder directive.
 *
 * Usage:
 *      &lt;input type="text" i18n-placeholder="your.i18n.key"></input&gt;
 */
 export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];