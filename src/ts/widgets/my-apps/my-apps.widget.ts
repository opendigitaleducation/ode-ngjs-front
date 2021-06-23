import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, IWebApp, NotifyFrameworkFactory } from "ode-ts-client";

/* Controller for the directive */
class Controller implements IController {
	apps:IWebApp[] = [];
	redirect( path:string ) {
		window.location.href = path;
	};
	getCssType( app:IWebApp ):string {
		return app.displayName.toLowerCase();
	}

}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./my-apps.widget.html').default;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
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

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORING THE MODULE NAME :
export const odeModuleName = "odeMyAppsWidgetModule";
angular.module( odeModuleName, []).directive( "odeMyAppsWidget", DirectiveFactory );
