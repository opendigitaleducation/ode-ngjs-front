import { IAttributes, IController, IDirective, IScope } from "angular";
import { IIdiom, ITheme, IWebApp } from "ode-ts-client";
import { conf, session, http } from "../../../utils";
import { SessionService, NgHelperService, ThemeHelperService } from "../../../services";
import $ from "jquery"; // FIXME : remove jQuery dependency 

// Controller for the directive
export class Controller implements IController {
    constructor(
		public session:SessionService,
		public helperSvc: NgHelperService,
		public themeSvc:ThemeHelperService ) {
	}
	public skin?:ITheme;
	public conversationUnreadUrl?:String;
	public currentLanguage:string = "";
	public username:string = "";
	public avatar:string = "no-avatar.svg";
	public messagerieLink:string = '/zimbra/zimbra';
	public mysearch:string = "";
	public apps:IWebApp[] = [];

	public is1D:boolean = false;
	public is2D:boolean = false;

	refreshAvatar() {
		this.avatar = session().avatarUrl;
		this.username = session().description.displayName;
	};

	openApps(event:any){
		const width = $(window).width()
		if( typeof width === "number" && width <= 700){
			event.preventDefault();
		}
	}

	launchSearch(event:any) {
		let words = this.mysearch;
		if (event != "link") event.stopPropagation();
		if ((event == "link" ||  event.keyCode == 13)) {
			words = (!words || words === '') ? ' ' : words;
			this.mysearch = "";
			window.location.href = '/searchengine#/' + words;
		}
	};

	getIconClass(app:IWebApp) {
		const appCode = this.themeSvc.getIconCode(app);
		return `ic-app-${appCode} color-app-${appCode}`;
	}
}

/*
 *	Customized scope for the directive.
 *	/!\ Required for compatibility with old portal templates. /!\
 */
interface Scope extends IScope {
	lang?:IIdiom;
	nbNewMessages?:number;
	version?:string;
	me?:{
		hasWorkflow(right:string):boolean;
	};

	messagerieLink?: string;
	goToMessagerie?: () => void;
	refreshMails?: () => void;
	refreshAvatar?: () => void;
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
//	replace = true; // requires a template with a single root HTML element to work.
	template = require('./navbar.directive.html').default;
	scope = {
		title: "@?"
	};
	bindToController = true;
	controller = ['odeSession', "odeNgHelperService", "odeThemeHelperService", Controller];
	controllerAs = 'ctrl';
	require = ['odeNavbar'];

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const platform = conf().Platform;

		// Legacy code (angular templates in old format)
		scope.lang = platform.idiom;
		scope.nbNewMessages = 0;
		scope.version = platform.deploymentTag;
		scope.me = {
			hasWorkflow(right:string):boolean {
				return session().hasWorkflow(right);
			}
		};
		scope.goToMessagerie = () => {
			console.log(scope.messagerieLink);
			// FIXME This is the old-fashioned way of accessing preferences. Do not reproduce anymore (use ode-ts-client lib instead)
			http().get('/userbook/preference/zimbra').then( data => {
				try{
					if( data.preference? JSON.parse(data.preference)['modeExpert'] && scope.me?.hasWorkflow('fr.openent.zimbra.controllers.ZimbraController|preauth') : false){
							scope.messagerieLink = '/zimbra/preauth';
							window.open(scope.messagerieLink);
						} else {
							scope.messagerieLink = '/zimbra/zimbra';
							window.location.href = window.location.origin + scope.messagerieLink;
						}
						console.log(scope.messagerieLink);
				} catch(e) {
					scope.messagerieLink = '/zimbra/zimbra';
				}
			});
		}
		scope.refreshMails = () => {
			if(scope.me?.hasWorkflow('fr.openent.zimbra.controllers.ZimbraController|view')){
				http().get('/zimbra/count/INBOX', {queryParams:{unread: true, _:new Date().getTime()}}).then( nbMessages => {
					scope.nbNewMessages = nbMessages.count;
					scope.$apply('nbNewMessages');
				});
	
			} else {
				http().get('/conversation/count/INBOX', {queryParams:{unread: true, _:new Date().getTime()}}).then( nbMessages => {
					scope.nbNewMessages = nbMessages.count;
					scope.$apply('nbNewMessages');
				});
			}
		}
		scope.refreshAvatar = () => {
			ctrl.refreshAvatar();
		}

		Promise.all([
			ctrl.session.getLanguage(),
			platform.theme.onOverrideReady(),
			ctrl.session.getBookmarks(),
			platform.theme.onFullyReady() // required for getting school degree
		]).then( (values) => {
			ctrl.skin = platform.theme;
			ctrl.is1D = platform.theme.is1D;
			ctrl.is2D = platform.theme.is2D;
			ctrl.currentLanguage = values[0];

			const overrides = values[1];
			if( overrides.portal ) {
				if(overrides.portal.indexOf('conversation-unread') !== -1){
					ctrl.conversationUnreadUrl = '/assets/themes/' + platform.theme.skin + '/template/portal/conversation-unread.html?hash=' + platform.deploymentTag;
				}
			}
			ctrl.refreshAvatar();
			scope.refreshMails && scope.refreshMails();

			ctrl.apps = values[2];

			scope.$apply();
		});
	}
}

/** The navbar directive.
 *
 * Usage:
 *      &lt;ode-navbar title="Some text"></ode-navbar&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}