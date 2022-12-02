import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IUserDescription, IUserInfo, School, WidgetFrameworkFactory, WidgetUserPref, WIDGET_NAME } from "ode-ts-client";
import { conf, notif, session, http, Base64 } from "../../utils";

class BriefmeArticle
{
	public titre: string;
	public publication: string;
	public url: string;

	constructor(titre: string, publication: string, url: string)
	{
		this.titre = titre;
		this.publication = publication;
		this.url = url;
	}
};

class BriefmeSection
{
	public nom: string;
	public url: string;

	public articles: BriefmeArticle[] = [];

	constructor(nom: string, url: string)
	{
		this.nom = nom;
		this.url = url;
	}

	public async charger()//: void
	{
		let reponse = await http().get(this.url, { headers: {"Accept": "application/json"}});
		
		for(let entree of reponse.results)
			this.articles.push(new BriefmeArticle(entree.title, entree.published_at, entree.url));
	}
}

/* Controller for the directive */
class Controller implements IController
{
	private _userPref?:WidgetUserPref;
	private selectedSchool?:School;
	private parametrage:boolean = false;

	private sections: BriefmeSection[] = [
		new BriefmeSection("Brief.eco", "/appregistry/widget/cache/external/briefeco"),
		new BriefmeSection("Brief.me", "/appregistry/widget/cache/external/briefme"),
		new BriefmeSection("Brief.science", "/appregistry/widget/cache/external/briefscience")
	];
	public contenu: BriefmeSection = this.sections[0];

	protected get description():IUserDescription {
		return session().description;
	}

	public async initialize() {
		this._userPref = WidgetFrameworkFactory.instance().list.find( w => w.platformConf.name===WIDGET_NAME.BRIEFME)?.userPref;
		await notif().onSessionReady().promise;

		let defaultIndex = 0;
		if( this._userPref?.schoolId && angular.isArray(this.description.schools) ) {
			defaultIndex = this.description.schools.findIndex( school => school.id===this._userPref?.schoolId );
			if( defaultIndex < 0 ) {
				defaultIndex = 0;
			}
		}
		this.setSelectedSchool( defaultIndex );

		for(let section of this.sections)
			await section.charger();

		this.ouvrirBrief(this.sections[Math.floor(this.sections.length / 2)]);
	}


	private setSelectedSchool( idx:number ):boolean {
		if( 0 <= idx && idx < this.description.schools.length && this.selectedSchool !== this.description.schools[idx]) {
			this.selectedSchool = this.description.schools[idx];
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

	private ouvrirBrief(brief: BriefmeSection)
	{
		this.contenu = brief;
	}

	public genererLien(article: BriefmeArticle)
	{
		let urlBase: string = article.url;
		let UAIb64: string = Base64.encode(this.selectedSchool?.UAI != null ? this.selectedSchool?.UAI : "");
		let exports: string[] = this.selectedSchool?.exports != null ? this.selectedSchool?.exports : [];
		let codeGARb64 = Base64.encode(exports != null && exports.length > 0 ? exports[0] : "");

		return urlBase.replace("ID_ETAB", UAIb64).replace("ID_ENT", codeGARb64);
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./briefme-widget.widget.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeBriefmeWidget'];

    async link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]) {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) {
            return;
		}

		await ctrl.initialize();
		scope.$apply();
	}
}

/** The briefme widget. */
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
export const odeModuleName = "odeBriefmeWidgetModule";
angular.module( odeModuleName, []).directive( "odeBriefmeWidget", DirectiveFactory );
