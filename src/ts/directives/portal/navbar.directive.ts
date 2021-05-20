import { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, IIdiom } from "ode-ts-client";
import { SessionService } from "../../services/session.service";
import { UserService } from "../../services/user.service";

// Controller for the directive
export class Controller implements IController {
    constructor(
            private me:UserService,
            private session:SessionService/*, skin*/
        ) {
//		this.skin = skin;
//		this.currentLanguage = currentLanguage;
	}
//	skin:any;
//	currentLanguage:string;

// 	nbNewMessages = 0;
// 	rand = Math.random();
//     messagerieLink = '/zimbra/zimbra';

// 	refreshAvatar(){
// 		http().get('/userbook/api/person', {}, {requestName: "refreshAvatar"}).done(function(result){
// 			$scope.avatar = result.result['0'].photo;
// 			if (!$scope.avatar || $scope.avatar === 'no-avatar.jpg' || $scope.avatar === 'no-avatar.svg') {
//                 $scope.avatar = skin.basePath + '/img/illustrations/no-avatar.svg';
//             }
// 			$scope.username = result.result['0'].displayName;
// 			model.me.profiles = result.result['0'].type;
// 			$scope.$apply();
// 		});
// 	};

//     goToMessagerie(){
//         console.log($scope.messagerieLink);
//         http().get('/userbook/preference/zimbra').done(function(data){
//             try{
//                if( data.preference? JSON.parse(data.preference)['modeExpert'] && model.me.hasWorkflow('fr.openent.zimbra.controllers.ZimbraController|preauth') : false){
//                         $scope.messagerieLink = '/zimbra/preauth';
//                         window.open($scope.messagerieLink);
//                     } else {
//                         $scope.messagerieLink = '/zimbra/zimbra';
//                         window.location.href = window.location.origin + $scope.messagerieLink;
//                     }
//                     console.log($scope.messagerieLink);
//             } catch(e) {
//                 $scope.messagerieLink = '/zimbra/zimbra';
//             }
//         })
//     };

// 	refreshMails(){
// 	    if(model.me.hasWorkflow('fr.openent.zimbra.controllers.ZimbraController|view')){
//             http().get('/zimbra/count/INBOX', { unread: true }).done(function(nbMessages){
//                 $scope.nbNewMessages = nbMessages.count;
//                 $scope.$apply('nbNewMessages');
//             });

//         }else{
//             http().get('/conversation/count/INBOX', { unread: true }).done(function(nbMessages){
//                 $scope.nbNewMessages = nbMessages.count;
//                 $scope.$apply('nbNewMessages');
//             });
//         }

// 	};

// 	openApps(event){
// 		if($(window).width() <= 700){
// 			event.preventDefault();
// 		}
// 	}

// 	http().get('/directory/userbook/' + model.me.userId).done(function(data){
// 		model.me.userbook = data;
// 		$scope.$apply('me');
// 	});

// 	skin.listThemes(function(themes){
// 		$scope.themes = themes;
// 		$scope.$apply('themes');
// 	});

// 	$scope.$root.$on('refreshMails', $scope.refreshMails);

// 	$scope.refreshMails();
// 	$scope.refreshAvatar();
// 	$scope.currentURL = window.location.href;
// }]
}

/* Customized scope for the directive. */
interface Scope extends IScope {
	lang?:IIdiom;
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
	controller = ['odeUser', 'odeSession', Controller];
	controllerAs = 'ctrl';

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		scope.lang = ConfigurationFrameworkFactory.instance.Platform.idiom;
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