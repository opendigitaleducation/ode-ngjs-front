import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IWidget, WidgetFrameworkFactory, WidgetPosition } from "ode-ts-client";
import { NgHelperService, WidgetService } from "../../services";

/* Controller for the directive */
export class Controller implements IController {
    constructor(
		public widgetSvc: WidgetService,
		public helperSvc: NgHelperService
		) {
    }
    position?: WidgetPosition;
	widgets?: IWidget[];

	loadWidgets() {
		this.widgets = this.widgetSvc.list()
			.filter( w => w.userPref.position===this.position && (w.platformConf.mandatory||w.userPref.show) )
			.sort( (a,b) => {
				return a.userPref.index < b.userPref.index
					? -1 
					: a.userPref.index === b.userPref.index ? 0 : 1;
			});
	}

	updateAndSave() {
		this.widgets?.forEach( (w,i) => {
			w.userPref.index = i;
		});
		return WidgetFrameworkFactory.instance().saveUserPrefs();
	}

	checkPosition( widget:IWidget ) {
		return widget.userPref?.position === this.position || (widget.userPref?.position==="left" && !this.position );
	}

	get allowedDndTypes():string[] {
		return [''+this.position];
	}

	get isMobileView():boolean {
		return this.helperSvc.viewport<992;
	}

	onDnDDrop(event:DragEvent, itemId:string, index:number, dropEffect:string) {
		if( this.widgets && 0<=index && index<=this.widgets.length ) {
			const oldIdx = this.widgets.findIndex( (w) => {
				return w.platformConf.id===itemId
			});
			if( oldIdx===-1 || oldIdx === index ) {
				// No change.
				return false;
			}

			const item = this.widgets[oldIdx];
			this.widgets.splice( oldIdx, 1 );
			if( index > 0 && index >= oldIdx) {
				// Adjust new index since it has just changed.
				index--;
			}
			this.widgets.splice( index, 0, item );

			this.updateAndSave();

			// return true when the function takes care of inserting the element, see doc https://github.com/marceljuenemann/angular-drag-and-drop-lists
			return true;
		}
		return false;
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	template = require('./widget-container.directive.html').default;
	scope = {};
	bindToController = true;
	controller = ["odeWidgetService", "odeNgHelperService", Controller];
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
