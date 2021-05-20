import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const idiom = ConfigurationFrameworkFactory.instance.Platform.idiom;

/*
/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        attrs.$observe('i18nValue', val => {
            const compiled = this.$compile('<span>' + idiom.translate(attrs.i18nValue) + '</span>')(scope);
            setTimeout(function(){
                elem.attr('value', compiled.text());
            }, 10);
        });
    }

    constructor(private $compile:ICompileService) {
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