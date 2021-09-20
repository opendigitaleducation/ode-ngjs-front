import { IAttributes, IController, IDirective, IScope } from "angular";
import { RichContentService } from "../../..";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	constructor( private richContentSvc:RichContentService ){
	}
	restrict= 'A';
	scope= {
		bindHtml: '='
	};
	
	link(scope:IScope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		scope.$watch('bindHtml', (newVal)=>this.richContentSvc.apply(newVal as string ?? '', element, scope) );
	}


}

/**
 * The bind-html directive.
 * 
 * Usage:
 *   &lt;div bind-html="angular_expression" ></div&gt;
 */
 export function DirectiveFactory(richContentSvc:RichContentService) {
	return new Directive(richContentSvc);
}
DirectiveFactory.$inject = ["odeRichContentService"];