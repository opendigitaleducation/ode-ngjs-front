import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, IUserDescription, IUserInfo, NotifyFrameworkFactory, School, SessionFrameworkFactory } from "ode-ts-client";
import { ThemeHelperService } from "../../services";

/* Controller for the directive */
class Controller implements IController {
	constructor( 
		private themeHelperSvc:ThemeHelperService
	) {}
	private get me():IUserInfo {
		return SessionFrameworkFactory.instance().session.user;
	}
	private get description():IUserDescription {
		return SessionFrameworkFactory.instance().session.description;
	}

	public async initialize() {
		this.themePath = await this.themeHelperSvc.getBootstrapThemePath();
		await NotifyFrameworkFactory.instance().onSessionReady().promise;
		this.setSelectedSchool( 0 );
	}

	private selectedSchool?:School;
	public themePath?:string;

	public getWidgetStyle() {
		return {
			'background-image': "url("+ this.themePath +"/images/wallpaper3.png)"
		};
	}

	public setSelectedSchool( idx:number ) {
		if( 0 <= idx && idx < this.description.schools.length ) {
			this.selectedSchool = this.description.schools[idx];
		}
	}

	private getDefaultUrl() {
		return "/userbook/annuaire#/search";
	}
	
	public getUrlTeachersOfMyClass() {
		if( this.me.classes && this.me.classes.length>0 )
			return "/userbook/annuaire#/search?filters=groups&class="+this.me.classes[0]+"&profile=Teacher";
		return this.getDefaultUrl();
	}
	public getUrlStudentsOfMyClasses() {
		let url = this.getDefaultUrl() + "?filters=groups&profile=Student";
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
			return "/userbook/annuaire#/search?filters=groups&structure="+this.selectedSchool.id+"&profile=Personnel";
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

    async link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined) {
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
NotifyFrameworkFactory.instance().onLangReady().promise.then( lang => {
	switch( lang ) {
		case "en":	ConfigurationFrameworkFactory.instance().Platform.idiom.addKeys( require('./i18n/en.json') ); break;
		default:	ConfigurationFrameworkFactory.instance().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
	}
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeSchoolWidgetModule";
angular.module( odeModuleName, []).directive( "odeSchoolWidget", DirectiveFactory );
