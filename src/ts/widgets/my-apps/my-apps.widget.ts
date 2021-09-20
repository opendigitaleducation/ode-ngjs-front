import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, IWebApp, NotifyFrameworkFactory } from "ode-ts-client";

/* Controller for the directive */
class Controller implements IController {
	apps:IWebApp[] = [];
	redirect( path:string ) {
		window.location.href = path;
	};
	getCssClass( app:IWebApp ):string {
		// @see distinct values for app's displayName is in query /auth/oauth2/userinfo
		// @see also navbar.directive.ts
		let appCode = app.displayName.toLowerCase();
		switch( appCode ) {
			case "admin.title": 	appCode = "admin"; break;
			case "directory.user":	appCode = "userbook"; break;
			default: break;
		}
		return `ic-app ${appCode} color-app-${appCode}`;
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./my-apps.widget.html').default;
	controller = [Controller];
	controllerAs = 'ctrl';
    require = ['odeMyApps'];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		NotifyFrameworkFactory.instance().onSessionReady().promise.then( () => {
			ctrl.apps = ConfigurationFrameworkFactory.instance().User.bookmarkedApps;
			scope.$apply();
		})
	}
}

/** The my-apps widget. */
function DirectiveFactory() {
	return new Directive();
}

// Preload translations
NotifyFrameworkFactory.instance().onLangReady().promise.then( lang => {
	switch( lang ) {
		default:	ConfigurationFrameworkFactory.instance().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
	}
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeMyAppsModule";
angular.module( odeModuleName, []).directive( "odeMyApps", DirectiveFactory );
