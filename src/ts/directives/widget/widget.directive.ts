import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IWidget, TransportFrameworkFactory, WidgetPosition } from "ode-ts-client";
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
	//template = require('./widget-container.directive.html').default;
	templateUrl?:string=undefined;
	scope = {
		widget: "=odeWidget"
	};
	bindToController = true;
	controller = ["odeWidgetService", Controller];
	controllerAs = 'ctrl';
	require = ["odeWidget"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;

		this.templateUrl = ctrl.widget.platformConf.path;
		TransportFrameworkFactory.instance().http.loadScript(ctrl.widget.platformConf.js, {disableNotifications:true}).then(
			()=> {scope.$apply();}
		);
	}
}

/** The widget directive.
 *
 * Usage:
 *      &lt;div ode-widget="anIWidget"></div&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
