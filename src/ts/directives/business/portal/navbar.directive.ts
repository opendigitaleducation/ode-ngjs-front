import { IAttributes, IController, IDirective, IScope } from "angular";
import { BootstrappedNotice, ConfigurationFrameworkFactory, EVENT_NAME, IIdiom, NotifyFrameworkFactory, SessionFrameworkFactory, TransportFrameworkFactory, ITheme } from "ode-ts-client";
import { SessionService } from "../../../services/session.service";
import { UserService } from "../../../services/user.service";
import $ from "jquery"; // FIXME : remove jQuery dependency 

// Controller for the directive
export class Controller implements IController {
    constructor(
			private $scope:Scope,
            private me:UserService,
            private session:SessionService
        ) {
	}
	public skin?:ITheme;
	public conversationUnreadUrl?:String;
	public currentLanguage:string = "";
	public username:string = "";
	public avatar:string = "no-avatar.svg";
	public messagerieLink:string = '/zimbra/zimbra';
	public mysearch:string = "";

	refreshAvatar() {
		const session = SessionFrameworkFactory.instance().session;
		this.avatar = session.description.photo;
		if (!this.avatar || this.avatar === 'no-avatar.jpg' || this.avatar === 'no-avatar.svg') {
			const basePath = ConfigurationFrameworkFactory.instance().Platform.theme.basePath;				
			this.avatar = basePath + '/img/illustrations/no-avatar.svg';
		}
		this.username = session.description.displayName;
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


// 	skin.listThemes(function(themes){
// 		$scope.themes = themes;
// 		$scope.$apply('themes');
// 	});

// 	$scope.$root.$on('refreshMails', $scope.refreshMails);

// 	$scope.refreshMails();
// 	$scope.currentURL = window.location.href;
// }]
}

/*
 *	Customized scope for the directive.
 *	Required for compatibility with old portal templates.
 */
interface Scope extends IScope {
	lang?:IIdiom;
	nbNewMessages?:number;
	version?:string;
	me?:{
		hasWorkflow(right:string):boolean;
		bookmarkedApps:[];
	};

	messagerieLink?: string;
	goToMessagerie?: () => void;
	refreshMails?: () => void;
	refreshAvatar?: () => void;
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
//	replace = true; // requires a template with a single root HTTML element to work.
	template = require('./navbar.directive.html').default;
	scope = {
		title: "@?"
	};
	bindToController = true;
	controller = ['$scope','odeUser', 'odeSession', Controller];
	controllerAs = 'ctrl';
	require = ['odeNavbar'];

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const platform = ConfigurationFrameworkFactory.instance().Platform;
		const http = TransportFrameworkFactory.instance().http;

		// Legacy code (angular templates in old format)
		scope.lang = platform.idiom;
		scope.nbNewMessages = 0;
		scope.version = platform.deploymentTag;
		scope.me = {
			hasWorkflow(right:string):boolean {
				return SessionFrameworkFactory.instance().session.hasWorkflow(right);
			},
			bookmarkedApps: []
		};
		scope.goToMessagerie = () => {
			console.log(scope.messagerieLink);
			http.get('/userbook/preference/zimbra').then( data => {
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
				http.get('/zimbra/count/INBOX', {queryParams:{unread: true}}).then( nbMessages => {
					scope.nbNewMessages = nbMessages.count;
					scope.$apply('nbNewMessages');
				});
	
			} else {
				http.get('/conversation/count/INBOX', {queryParams:{unread: true}}).then( nbMessages => {
					scope.nbNewMessages = nbMessages.count;
					scope.$apply('nbNewMessages');
				});
			}
		}
		scope.refreshAvatar = () => {
			ctrl.refreshAvatar();
		}


		Promise.all([
			this.getCurrentLanguage(),
			platform.theme.onOverrideReady()
		]).then( (values) => {
			ctrl.skin = platform.theme;
			ctrl.currentLanguage = values[0];

			const overrides = values[1];
			if( overrides.portal ) {
				if(overrides.portal.indexOf('conversation-unread') !== -1){
					ctrl.conversationUnreadUrl = '/assets/themes/' + platform.theme.skin + '/template/portal/conversation-unread.html?hash=' + platform.deploymentTag;
				}
			}
			ctrl.refreshAvatar();
			scope.$apply();
		});
	}

	getCurrentLanguage():Promise<string> {
		return new Promise( (resolve, reject) => {
			const bootstrapped = NotifyFrameworkFactory.instance().onEvent<BootstrappedNotice>( EVENT_NAME.BOOTSTRAPPED ).subscribe( ev => {
				bootstrapped.unsubscribe();
				resolve( SessionFrameworkFactory.instance().session.currentLanguage );
			});
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