import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, NotifyFrameworkFactory } from "ode-ts-client";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./qwant-widget.widget.html').default;
}

/** The qwant widget. */
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
export const odeModuleName = "odeQwantModule";
angular.module( odeModuleName, []).directive( "odeQwant", DirectiveFactory );
