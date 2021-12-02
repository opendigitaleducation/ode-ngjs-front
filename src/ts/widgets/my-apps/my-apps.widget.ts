import angular, { IAttributes, IController, IDirective } from "angular";
import { IWebApp } from "ode-ts-client";
import { conf, notif, TrackedScope, TrackedAction, TrackedActionFromWidget } from "../../utils";
import { ThemeHelperService } from "../../services";

/* Controller for the directive */
class Controller implements IController {
    constructor(
		public themeSvc: ThemeHelperService
		) {
    }
	apps:IWebApp[] = [];
	redirect( path:string ) {
		window.location.href = path;
	};

	getIconClass(app:IWebApp) {
		const appCode = this.themeSvc.getIconCode(app);
		return `ic-app-${appCode} color-app-${appCode}`;
	}
}

/* Directive */
class Directive implements IDirective<TrackedScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./my-apps.widget.html').default;
	controller = ["odeThemeHelperService", Controller];
	controllerAs = 'ctrl';
    require = ['odeMyApps'];

    link(scope:TrackedScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		notif().onSessionReady().promise.then( () => {
			ctrl.apps = conf().User.bookmarkedApps;
			scope.$apply();
		});

		// Give an opportunity to track some events from outside of this widget.
		scope.trackEvent = (e:Event, p:CustomEventInit<TrackedAction>) => {
			// Allow events to bubble up.
			if(typeof p.bubbles === "undefined") p.bubbles = true;

			let event = null;
			if( p && p.detail?.open==='app' ) {
				event = new CustomEvent( TrackedActionFromWidget.myApps, p );
			} else if( p && p.detail?.open==='more' ) {
				event = new CustomEvent( TrackedActionFromWidget.myApps, p );
			}
			if( event && e.currentTarget ) {
				e.currentTarget.dispatchEvent(event);
			}
		}
	}
}

/** The my-apps widget. */
function DirectiveFactory() {
	return new Directive();
}

// Preload translations
notif().onLangReady().promise.then( lang => {
	switch( lang ) {
		default:	conf().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
	}
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeMyAppsModule";
angular.module( odeModuleName, []).directive( "odeMyApps", DirectiveFactory );
