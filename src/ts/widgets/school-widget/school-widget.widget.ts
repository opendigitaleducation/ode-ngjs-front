import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IUserDescription, IUserInfo, School } from "ode-ts-client";
import { conf, notif, session } from "../../utils";
import { ThemeHelperService } from "../../services";

/* Controller for the directive */
class Controller implements IController {
	constructor( 
		private themeHelperSvc:ThemeHelperService
	) {}
	private get me():IUserInfo {
		return session().user;
	}
	private get description():IUserDescription {
		return session().description;
	}
	public get avatar():string {
		return session().avatarUrl;
	}

	public async initialize() {
		this.themePath = await this.themeHelperSvc.getBootstrapThemePath();
		await notif().onSessionReady().promise;
		this.setSelectedSchool( 0 );
	}

	private selectedSchool?:School;
	public themePath?:string;

	public getWidgetStyle() {
		return {
			'background-image': "url("+ this.themePath +"/images/widget-3.png)"
		};
	}

	public setSelectedSchool( idx:number, ev?:JQuery.Event ) {
		if( 0 <= idx && idx < this.description.schools.length ) {
			// If an event is given, and related to pressing the enter or spacebar key.
			if( !ev || (ev.type==='keydown' && (ev.which===13 || ev.which===32)) ) {	
				this.selectedSchool = this.description.schools[idx];
				return true;
			}
		}
		return false;
	}

	private getDefaultUrl() {
		return "/userbook/annuaire#/search";
	}
	
	public getUrlTeachersOfMyClass() {
		let url = this.getDefaultUrl();
		if( this.me.classes && this.me.classes.length>0 ) {
			url += "?filters=groups&profile=Teacher";
			for( let clazz of this.me.classes ) {
				url += "&class="+clazz;
			}
		}
		return url;
	}
	public getUrlStudentsOfMyClasses() {
		let url = this.getDefaultUrl() + "?filters=groups&profile=Student";
		if( this.selectedSchool ) {
			url += "&structure="+this.selectedSchool.id;
		}
		for( let clazz of this.me.classes ) {
			url += "&class="+clazz;
		}
		return url;
	}
	public getUrlSchoolTeachers() {
		if( this.selectedSchool )
			return "/userbook/annuaire#/search?filters=groups&structure="+this.selectedSchool.id+"&profile=Teacher";
		return this.getDefaultUrl();
	}
	public getUrlTeachersOfMyChildren() {
		let url = this.getDefaultUrl() + "?filters=groups&profile=Teacher";
		for( let clazz of this.me.classes ) {
			url += "&class="+clazz;
		}
		return url;
	}
	public getUrlSchoolPersonnels() {
		if( this.selectedSchool )
			return "/userbook/annuaire#/search?filters=users&structure="+this.selectedSchool.id+"&profile=Personnel";
		return this.getDefaultUrl();
	}

	get hasManySchools() {
		return this.description.schools.length > 1;
	}

	get isStudent():boolean {
		return this.me.type==="ELEVE";
	}
	get isTeacher():boolean {
		return this.me.type==="ENSEIGNANT";
	}
	get isRelative():boolean {
		return this.me.type==="PERSRELELEVE";
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./school-widget.widget.html').default;
	controller = ["odeThemeHelperService", Controller];
	controllerAs = 'ctrl';
	require = ['odeSchoolWidget'];

    async link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]) {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		await ctrl.initialize();
		scope.$apply();
	}
}

/** The school-widget widget. */
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
export const odeModuleName = "odeSchoolWidgetModule";
angular.module( odeModuleName, []).directive( "odeSchoolWidget", DirectiveFactory );
