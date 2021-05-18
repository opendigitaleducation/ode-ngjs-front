import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const idiom = ConfigurationFrameworkFactory.instance.idiom;

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
    replace = true;

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        /* FIXME What is this, and why pollute the scope ??
        if(attrs.params){
            var params = scope.$eval(attrs.params);
            for(var i = 0; i < params.length; i++){
                scope[i] = params[i];
            }
        }
        */

        attrs.$observe('content', val => {
            if(!attrs.content){
                return;
            }
            elem.html( this.$compile('<span class="no-style">' + idiom.translate(attrs.content) + '</span>')(scope).text() );
        });

        attrs.$observe('attr', val => {
            if(!attrs.attr){
                return;
            }
            var compiled = this.$compile('<span>' + idiom.translate(attrs[attrs.attr]) + '</span>')(scope);
            setTimeout(function(){
                elem.attr(attrs.attr, compiled.text());
            }, 10);
        });

        attrs.$observe('attrs', val => {
            if(!attrs.attrs){
                return;
            }
            var attrObj = scope.$eval(attrs.attrs);
            for(var prop in attrObj){
                const compiled = this.$compile('<span>'+ idiom.translate(attrObj[prop]) +'</span>')(scope);
                setTimeout(function(){
                    elem.attr(prop, compiled.text());
                }, 0);
            }
        })

        attrs.$observe('key', val => {
            if(!attrs.key){
                return;
            }
            elem.html( this.$compile('<span class="no-style">'+ idiom.translate(attrs.key) +'</span>')(scope).text() );
        });
    }

    /* Constructor with Dependency Injection */
    constructor(private $compile:ICompileService) {
    }
}

/** The translate directive.
 *
 * Usage:
 *      &lt;div translate key="your.i18n.key"></div&gt;
 * or
 *      &lt;label translate content="your.i18n.key"></label&gt;
 * or
 *      &lt;input placeholder="your.placeholder.key" translate attr="placeholder"></input&gt;
 * or
 *      &lt;input translate attrs="{placeholder:'your.placeholder.key', value:'another.i18n.key'}"></input&gt;
 */
export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];