import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { UserPreferenceKey } from "ode-ts-client";
import { conf } from "../../../utils";

interface Scope extends IScope {
	header?: string;
	since?: string;
	userprefsKey?: UserPreferenceKey;
	userprefsField: string;
	onChange: ( params:{'$visible':Boolean} ) => void;
	saveOnChange?: Boolean;
	showOnce?: Boolean;
	show?: Boolean;
	visible: (value?:Boolean) => boolean|void;
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
	restrict= 'E';
	template = require("./infotip.directive.html").default;
	scope= {
		header: "@?",
		since: "@?",
		userprefsKey: "@?",
		userprefsField: '@',
		onChange: '&?', 
		saveOnChange: "=?",
		showOnce: "=?",
		show: "=?"
	};
	transclude= true;

	async link(scope:Scope, element:JQLite, attributes:IAttributes, controllers?:IController[]) {
		// 2 cases, depending on the prefsKey scoped value.
		let key:UserPreferenceKey = 'infotip';
		if( angular.isString(scope.userprefsKey) && scope.userprefsKey.trim().length > 0 ) {
			key = scope.userprefsKey.trim() as UserPreferenceKey;
		}

		// Helper function
		const notifyVisibility = (value?:Boolean) => {
			const val = value ?? scope.visible() as Boolean;
			scope.onChange && scope.onChange( {'$visible': val} );
			if( val ) {
				element.find('.toast').addClass('show');
			} else {
				element.find('.toast').removeClass('show');
			}
		}

		const preferences = conf().User.preferences;
		await preferences.load( key );

		// Helper get/set function
		scope.visible = function(value?: Boolean) {
			if( arguments.length <= 0 ) {
				return preferences.get(key)[scope.userprefsField]!==false ? true : false;
			} else {
				preferences.get(key)[scope.userprefsField] = value;
				notifyVisibility( value );
				if( !!scope.saveOnChange ) {
					preferences.save( key );
				}
			}
		}

		// Watch the show attribute, if any
		scope.$watch('show', newVal=>{ 
			if( typeof newVal !== "undefined" ) {
				scope.visible( newVal as Boolean );
			}
		});

		notifyVisibility();
		if( scope.showOnce ) {
			preferences.get(key)[scope.userprefsField] = false;	// Do not notify this visibility change.
			preferences.save( key );
		}
	}
}

/** The infotip directive.
 *
 * Usage:
 * &lt;ode-infotip 
 *  header?="title of the tip"
 * 	since?="small text"
 *	userprefs-field="yourVisibilityParam" 
 *	userprefs-key?="your_USER_PREFS_key"
 *	on-change?="yourCallback"
 *	show-once?="true|false"
 *  save-on-change?="true|false"
 *	show?="true|false">
 *		Put your content here.
 * </ode-infotip&gt;
 * 
 * @attribute  header Text to display in the header
 * @attribute  since Small text to display near the close button
 * @attribute userprefs-field The name that will be used to save the $visibility state.
 * @attribute userprefs-key A USER_PREFS key. Defaults to 'infotip'
 * @attribute on-change A callback that must accept a {'$visible':Boolean} parameter
 * @attribute show-once If set to true, the infotip will show once, and then its $visibility will be saved to false.
 * @attribute save-on-change If set to false, closing the infotip will not save its $visibility. You have to manage it elsewhere.
 * @attribute show If set, force displaying/hiding the tip.
 */
 export function DirectiveFactory() {
	return new Directive();
}
