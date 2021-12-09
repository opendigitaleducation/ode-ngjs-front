import angular, { IAttributes, IController, IDirective } from "angular";
import { IUserDescription, IUserInfo, School, WidgetFrameworkFactory, WidgetUserPref, WIDGET_NAME } from "ode-ts-client";
import { conf, notif, session, TrackedScope, TrackedAction, TrackedActionFromWidget } from "../../utils";
import { ThemeHelperService } from "../../services";

/* Controller for the directive */
class Controller implements IController {
	constructor( 
		private themeHelperSvc:ThemeHelperService
	) {}

	private get me():IUserInfo {
		return session().user;
	}
	protected get description():IUserDescription {
		return session().description;
	}
	protected get avatar():string {
		return session().avatarUrl;
	}

	private _userPref?:WidgetUserPref;

	public async initialize() {
		this._userPref = WidgetFrameworkFactory.instance().list.find( w => w.platformConf.name===WIDGET_NAME.SCHOOL)?.userPref;
		this.themePath = await this.themeHelperSvc.getBootstrapThemePath();
		await notif().onSessionReady().promise;

		// #WB-22, memorize the latest school choice
		let defaultIndex = 0;
		if( this._userPref?.schoolId && angular.isArray(this.description.schools) ) {
			defaultIndex = this.description.schools.findIndex( school => school.id===this._userPref?.schoolId );
			if( defaultIndex < 0 ) {
				defaultIndex = 0;
			}
		}
		this.setSelectedSchool( defaultIndex );
	}

	private selectedSchool?:School;
	private themePath?:string;

	protected getWidgetStyle() {
		return {
			'background-image': "url("+ this.themePath +"/images/widget-3.png)"
		};
	}

	protected onSchoolSelected( idx:number, ev?:JQuery.Event ) {
		// If an event is given, and related to pressing the enter or spacebar key.
		if( !ev || (ev.type==='keydown' && (ev.which===13 || ev.which===32)) ) {	
			if( this._userPref && this.setSelectedSchool(idx) ) {
				// Selected school changed => #WB-22, memorize the latest school choice
				this._userPref.schoolId = this.selectedSchool?.id;
				WidgetFrameworkFactory.instance().saveUserPrefs();
			}
			return true;
		}
		return false;
	}

	private setSelectedSchool( idx:number ):boolean {
		if( 0 <= idx && idx < this.description.schools.length && this.selectedSchool !== this.description.schools[idx]) {
			this.selectedSchool = this.description.schools[idx];
			return true;
		}
		return false;
	}

	private getDefaultUrl() {
		return "/userbook/annuaire#/search";
	}
	
	protected getUrlTeachersOfMyClass() {
		let url = this.getDefaultUrl();
		if( this.me.classes && this.me.classes.length>0 ) {
			url += "?filters=groups&profile=Teacher";
			for( let clazz of this.me.classes ) {
				url += "&class="+clazz;
			}
		}
		return url;
	}
	protected getUrlStudentsOfMyClasses() {
		let url = this.getDefaultUrl() + "?filters=groups&profile=Student";
		if( this.selectedSchool ) {
			url += "&structure="+this.selectedSchool.id;
		}
		for( let clazz of this.me.classes ) {
			url += "&class="+clazz;
		}
		return url;
	}
	protected getUrlSchoolTeachers() {
		if( this.selectedSchool )
			return "/userbook/annuaire#/search?filters=groups&structure="+this.selectedSchool.id+"&profile=Teacher";
		return this.getDefaultUrl();
	}
	protected getUrlTeachersOfMyChildren() {
		let url = this.getDefaultUrl() + "?filters=groups&profile=Teacher";
		for( let clazz of this.me.classes ) {
			url += "&class="+clazz;
		}
		return url;
	}
	protected getUrlSchoolPersonnels() {
		if( this.selectedSchool )
			return "/userbook/annuaire#/search?filters=users&structure="+this.selectedSchool.id+"&profile=Personnel";
		return this.getDefaultUrl();
	}
	protected getUrlSchoolPersonnelsAndTeachers() {
		if( this.selectedSchool )
			return "/userbook/annuaire#/search?filters=users&structure="+this.selectedSchool.id+"&profile=Personnel&profile=Teacher";
		return this.getDefaultUrl();
	}
	protected getUrlStudents() { 
		let url = this.getDefaultUrl() + "?filters=groups&profile=Student";
		if( this.selectedSchool ) {
			url += "&structure="+this.selectedSchool.id;
		}
		return url;
	}

	protected get hasManySchools() {
		return this.description.schools.length > 1;
	}

	protected get isStudent():boolean {
		return this.me.type==="ELEVE";
	}
	protected get isTeacher():boolean {
		return this.me.type==="ENSEIGNANT";
	}
	protected get isRelative():boolean {
		return this.me.type==="PERSRELELEVE";
	}
	protected get isPersonnel():boolean {
		return this.me.type==="PERSEDUCNAT";
	}
}

/* Directive */
class Directive implements IDirective<TrackedScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./school-widget.widget.html').default;
	controller = ["odeThemeHelperService", Controller];
	controllerAs = 'ctrl';
	require = ['odeSchoolWidget'];

    async link(scope:TrackedScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]) {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		await ctrl.initialize();
		scope.$apply();

		// Give an opportunity to track some events from outside of this widget.
		scope.trackEvent = (e:Event, p:CustomEventInit<TrackedAction>) => {
			// Allow events to bubble up.
			if(typeof p.bubbles === "undefined") p.bubbles = true;

			let event = null;
			if( p?.detail?.open &&
					['student.class'		,'student.teachers'
					,'teacher.students'		,'teacher.teachers'
					,'relative.teachers'	,'relative.direction'
					,'profile'
					].indexOf(p.detail.open)!==-1 ) {
				event = new CustomEvent( TrackedActionFromWidget.school, p );
			}
			if( event && e.currentTarget ) {
				e.currentTarget.dispatchEvent(event);
			}
		}
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
