import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const idiom = ConfigurationFrameworkFactory.instance.Platform.idiom;

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict='E';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        elem.html( this.$compile('<span class="no-style">'+ idiom.translate(elem.text().trim()) +'</span>')(scope).text() );
    }

    constructor(private $compile:ICompileService) {
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