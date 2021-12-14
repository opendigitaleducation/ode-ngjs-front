import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IWidget, WidgetFrameworkFactory, WidgetPosition } from "ode-ts-client";
import { NgHelperService, WidgetService } from "../../services";
import { TrackedAction, TrackedScope, TrackedActionFromWidget } from "../../utils";


/* Controller for the directive */
export class Controller implements IController {
    constructor(
		public widgetSvc: WidgetService,
		public helperSvc: NgHelperService
		) {
    }
    position?: WidgetPosition;
	/** Ordered list of widgets, which the user can reorder by DnD. */
	dndWidgets?: IWidget[];
	/** Ordered list of widgets, which the user can NOT reorder by DnD. */
	lockedWidgets?: IWidget[];

	/** Animation helper function to signal that drag'n'drop is not allowed. */
	signalReject?: ()=>void;

	/** Prepare the list of widgets targeting this container. */
	loadWidgets() {
		const onIndex = (a:IWidget,b:IWidget) => {
			return a.userPref.index < b.userPref.index
				? -1 
				: a.userPref.index === b.userPref.index ? 0 : 1;
		};
		this.dndWidgets = this.widgetSvc.list()
			.filter( w => w.userPref.position===this.position && w.userPref.show && !w.platformConf.mandatory )
			.sort( onIndex );
		this.lockedWidgets = this.widgetSvc.list()
			.filter( w => w.userPref.position===this.position && w.platformConf.mandatory )
			.sort( onIndex );
	}

	/** Save current widgets configuration as user's preferences. */
	updateAndSave() {
		this.dndWidgets?.forEach( (w,i) => {
			w.userPref.index = i;
		});
		// No need to save locked widgets, they will never move.
		return WidgetFrameworkFactory.instance().saveUserPrefs();
	}

	/** Truthy if the widget is targeting this container. */
	checkPosition( widget:IWidget ):boolean {
		return widget.userPref?.position === this.position || (widget.userPref?.position==="left" && !this.position );
	}

	/** Get the type of DnD this container accepts. */
	get allowedDndTypes():string[] {
		return [""+this.position];
	}

	get isMobileView():boolean {
		return this.helperSvc.viewport<992;
	}

	/* return true when the item can be dropped at specified index; see doc https://github.com/marceljuenemann/angular-drag-and-drop-lists */
	onDnDDragOver(event:DragEvent, index:number, type:string, dropEffect:string) {
		const allowed = type===this.position;
		console.log( "index="+index+", type="+type+", dropEffect="+dropEffect+", allowed="+allowed );
		if( !allowed ) {
			this.signalReject && this.signalReject();
		}
		return allowed;
	}

	onDnDDrop(event:DragEvent, itemId:string, index:number, dropEffect:string) {
		if( this.dndWidgets && 0<=index && index<=this.dndWidgets.length ) {
			const oldIdx = this.dndWidgets.findIndex( w => {
				return w.platformConf.id===itemId
			});
			if( oldIdx===-1 || oldIdx === index ) {
				// No change.
				return false;
			}

			const item = this.dndWidgets[oldIdx];
			this.dndWidgets.splice( oldIdx, 1 );
			if( index > 0 && index >= oldIdx) {
				// Adjust new index since it has just changed.
				index--;
			}
			this.dndWidgets.splice( index, 0, item );

			// DnD tracking : indexes are 1-based
			this.trackEvent(event, {detail:{'move':item.platformConf.name, 'from':oldIdx+1, 'to':index+1} });

			this.updateAndSave();

			// return true when the function takes care of inserting the element, see doc https://github.com/marceljuenemann/angular-drag-and-drop-lists
			return true;
		}
		return false;
	}

    // Give an opportunity to track some events from outside of this component.
    protected trackEvent(e:Event, p:CustomEventInit<TrackedAction>) {
        // Allow events to bubble up.
        if(typeof p.bubbles === "undefined") p.bubbles = true;

		let event = new CustomEvent( "ode-widget-container", p );
        if( event && e.currentTarget ) {
            e.currentTarget.dispatchEvent(event);
        }
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

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
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

		ctrl.signalReject = () => {
			const pulse = 'dndReject';
			const on = elem.children("ul[dnd-list][dnd-dragover]");
			if( ! on.hasClass(pulse) ) {
				on.addClass(pulse);
				// Removed it after a moment.
				setTimeout( ()=>{on.removeClass(pulse);}, 1500 );
			}
		}

		ctrl.widgetSvc.initialize()
		.then( () => {
			ctrl.position = attr.position;
			ctrl.loadWidgets();
			scope.$apply();
		});

		const subscription = ctrl.widgetSvc.onChange().subscribe({
			next: e => { 
				ctrl.loadWidgets();
				scope.$apply();
			}
		});

		scope.$on( "$destroy", () => {
			subscription && subscription.unsubscribe();
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
