import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { conf, notif, TrackedAction, TrackedScope, TrackedActionFromWidget } from "../../utils";

/* Directive */
class Directive implements IDirective<TrackedScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./qwant-widget.widget.html').default;

	link(scope:TrackedScope) {
		// Give an opportunity to track some events from outside of this widget.
		scope.trackEvent = (e:Event, p:CustomEventInit<TrackedAction>) => {
			// Allow events to bubble up.
			if(typeof p.bubbles === "undefined") p.bubbles = true;

			let event = null;
			if( p && (p.detail?.open==='qwant' || typeof p.detail?.search==='string') ) {
				event = new CustomEvent( TrackedActionFromWidget.qwant, p );
			}
			if( event && e.currentTarget ) {
				e.currentTarget.dispatchEvent(event);
			}
		}
	}
}

/** The qwant widget. */
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
export const odeModuleName = "odeQwantModule";
angular.module( odeModuleName, []).directive( "odeQwant", DirectiveFactory );
