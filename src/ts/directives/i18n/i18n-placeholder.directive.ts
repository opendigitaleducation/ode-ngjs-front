import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const idiom = ConfigurationFrameworkFactory.instance().Platform.idiom;

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        attrs.$observe('i18nPlaceholder', val => {
            const compiled = this.$compile('<span>' + idiom.translate(attrs.i18nPlaceholder) + '</span>')(scope);
            setTimeout(function(){
                elem.attr('placeholder', compiled.text());
            }, 10);
        });
    }

    constructor(private $compile:ICompileService) {
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