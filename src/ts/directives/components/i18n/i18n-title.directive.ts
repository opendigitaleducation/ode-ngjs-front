import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { I18nBase } from "./I18nBase";

/* Directive */
class Directive extends I18nBase implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        attrs.$observe('i18nTitle', val => {
            const compiled = this.$compile('<span>' + this.idiom.translate(attrs.i18nTitle) + '</span>')(scope);
            setTimeout(function(){
                elem.attr('title', compiled.text());
            }, 10);
        });
    }
}

/** The i18n-title directive.
 *
 * Usage:
 *      &lt;a i18n-title="your.i18n.key"></a&gt;
 */
 export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];