import angular, { IAttributes, IController, IDirective, IScope } from "angular";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./qwant-widget.widget.html').default;
}

/** The qwant widget. */
function DirectiveFactory() {
	return new Directive();
}

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORING THE MODULE NAME :
export const odeModuleName = "odeQwantWidgetModule";
angular.module( odeModuleName, []).directive( "odeQwantWidget", DirectiveFactory );
