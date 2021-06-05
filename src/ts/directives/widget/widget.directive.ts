import angular, { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { IWidget, TransportFrameworkFactory, WidgetPosition } from "ode-ts-client";
import { WidgetLoader } from "../../modules/widgets.module";
import { WidgetService } from "../../services";

/* Controller for the directive */
export class Controller implements IController {
    constructor(
		public widgetSvc: WidgetService
		) {
		this.widget = null as unknown as IWidget;
    }
	widget: IWidget;

}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
//	template?:string=undefined;
//	templateUrl?:string=undefined;
	scope = {
		widget: "=odeWidget"
	};
	bindToController = true;
	controller = ["odeWidgetService", Controller];
	controllerAs = 'ctrl';
	require = ["odeWidget"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined) {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;

		this.widgetLoader( ctrl.widget.platformConf.name )
		.then( () => {
			const htmlFragment=`<ode-${ctrl.widget.platformConf.name}>LOADING</ode-${ctrl.widget.platformConf.name}>`;
			const compiled = this.$compile(htmlFragment)(scope);
			elem.append( compiled );
		});
	}

    constructor(
		private $compile:ICompileService,
		private widgetLoader:WidgetLoader
		) {
    }
}

/** The widget directive.
 *
 * Usage:
 *      &lt;div ode-widget="anIWidget"></div&gt;
 */
export function DirectiveFactory($compile:ICompileService, widgetLoader:WidgetLoader) {
	return new Directive($compile, widgetLoader);
}
DirectiveFactory.$inject = ["$compile","odeWidgetModuleLoader"];
