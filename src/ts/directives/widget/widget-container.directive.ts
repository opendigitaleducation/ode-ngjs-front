import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IWidget, WidgetPosition } from "ode-ts-client";
import { WidgetService } from "../../services";

/* Controller for the directive */
export class Controller implements IController {
    constructor(
		public widgetSvc: WidgetService
		) {
    }
    position?: WidgetPosition;
	widgets?: IWidget[];

	loadWidgets() {
		this.widgets = this.widgetSvc.list().filter( w => w.userPref.position === this.position );
	}

	checkPosition( widget:IWidget ) {
		return widget.userPref?.position === this.position || (widget.userPref?.position==="left" && !this.position );
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	template = require('./widget-container.directive.html').default;
	scope = {};
	bindToController = true;
	controller = ["odeWidgetService", Controller];
	controllerAs = 'ctrl';
	require = ["odeWidgetContainer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const defaultOptions = {position:"left"};
		let attr = attrs["odeWidgetContainer"] ?? defaultOptions;
		if( typeof attr === "string" ) {
			try {
				attr = angular.fromJson(attr);
			} catch(e) {
				attr= defaultOptions;
			}
		}
		if( !attr.position ) {
			attr.position = "left";
		}

		ctrl.widgetSvc.initialize()
		.then( () => {
			ctrl.position = attr.position;
			ctrl.loadWidgets();
			scope.$apply();
		});

	}
}

/** The widget-container directive.
 *
 * Usage:
 *      &lt;div ode-widget-container="left|right"></div&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
