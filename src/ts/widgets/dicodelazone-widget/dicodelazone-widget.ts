import angular, { IAttributes, IController, IDirective, IScope } from "angular";

/* Controller for the directive */
class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
	}
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./dicodelazone-widget.html').default;
	controller = [Controller];

    link(scope:IScope, elem:JQLite, attrs:IAttributes): void {
		let blah = scope;
	}

}

/** The dicodelazone widget. */
function DirectiveFactory() {
	return new Directive();
}

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORING THE MODULE NAME :
export const odeModuleName = "odeDicodelazoneWidgetModule";
angular.module( odeModuleName, []).directive( "odeDicodelazoneWidget", DirectiveFactory );
