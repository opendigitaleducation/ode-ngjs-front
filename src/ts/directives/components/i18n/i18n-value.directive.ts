import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { I18nBase } from "./I18nBase";

/* Directive */
class Directive extends I18nBase implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        attrs.$observe('i18nValue', val => {
            const compiled = this.$compile('<span>' + this.idiom.translate(attrs.i18nValue) + '</span>')(scope);
            setTimeout(function(){
                elem.attr('value', compiled.text());
            }, 10);
        });
    }
}

/** The i18n-value directive.
 *
 * Usage:
 *      &lt;option i18n-value="your.i18n.key"></option&gt;
 */
 export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];