import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IUserDescription, IUserInfo, School, WidgetFrameworkFactory, WidgetUserPref, WIDGET_NAME } from "ode-ts-client";
import { conf, notif, session, http } from "../../utils";

/* Controller for the directive */
class Controller implements IController
{
	private _userPref?:WidgetUserPref;
	private selectedSchool?:School;

	protected get description():IUserDescription {
		return session().description;
	}

	public async initialize() {
		this._userPref = WidgetFrameworkFactory.instance().list.find( w => w.platformConf.name===WIDGET_NAME.UNIVERSALIS)?.userPref;
		console.log(this._userPref);
		await notif().onSessionReady().promise;

		let defaultIndex = 0;
		if( this._userPref?.schoolId && angular.isArray(this.description.schools) ) {
			defaultIndex = this.description.schools.findIndex( school => school.id===this._userPref?.schoolId );
			if( defaultIndex < 0 ) {
				defaultIndex = 0;
			}
		}
		this.setSelectedSchool( defaultIndex );
	}


	private setSelectedSchool( idx:number ):boolean {
		if( 0 <= idx && idx < this.description.schools.length && this.selectedSchool !== this.description.schools[idx]) {
			this.selectedSchool = this.description.schools[idx];
			console.log(this.selectedSchool);
			return true;
		}
		return false;
	}

	protected onSchoolSelected( idx:number, ev?:JQuery.Event ) {
		// If an event is given, and related to pressing the enter or spacebar key.
		if( !ev || (ev.type==='keydown' && (ev.which===13 || ev.which===32)) ) {	
			if( this._userPref && this.setSelectedSchool(idx) ) {
				this._userPref.schoolId = this.selectedSchool?.id;
				WidgetFrameworkFactory.instance().saveUserPrefs();
			}
			return true;
		}
		return false;
	}

	protected get hasManySchools() {
		return this.description.schools.length > 1;
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./universalis-widget.widget.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeUniversalisWidget'];

    async link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]) {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) {
            return;
		}

		await ctrl.initialize();
		scope.$apply();
	}
}

/** The universalis widget. */
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
export const odeModuleName = "odeUniversalisWidgetModule";
angular.module( odeModuleName, []).directive( "odeUniversalisWidget", DirectiveFactory );
