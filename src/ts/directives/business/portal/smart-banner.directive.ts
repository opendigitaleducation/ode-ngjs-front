import { IAttributes, IController, IDirective, IScope } from "angular";
import { conf, session, http } from "../../../utils";

interface Scope extends IScope {
    banner:any;
    showBanner:boolean;
    closeBanner:()=>void;
    getCookie:()=>void;
    setCookie:(cookie_value:string, expiresInDays:number)=>void;
    init:()=>Promise<void>;
    icon:string;
    store:string;
    appRef:string;
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
    templateUrl = require('./smart-banner.directive.lazy.html').default;

    link(scope:Scope, elem:JQLite, attr:IAttributes, controllers?:IController[]): void {
        const skin = conf().Platform.theme;
        const me = session().user;

        scope.closeBanner = () => {
            scope.setCookie("test",30);
            scope.showBanner = false;
        }
    
        // FIXME Déporter la gestion des cookies dans Transport ?
        scope.getCookie = () => {
            var name = "smartBanner" + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return null;
        }
    
        // FIXME Déporter la gestion des cookies dans Transport ?
        scope.setCookie = (cvalue:string, exdays:number) => {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = "smartBanner=" + cvalue + ";" + expires;
        }

        scope.showBanner = false;

        scope.init = async () => {
            try {
                const data = await http().get('/conf/smartBanner').then( data => { 
                    //if 200 ok=> display banner
                    if( http().latestResponse.status==200 && data!==null) {
                        return data;
                    }
                    return null;
                });
                if(data != null) {
                    scope.banner = data;
                    const excludedTypes = scope.banner[`excludeUserTypes-${skin.skin}`] || [];
                    if(excludedTypes.indexOf(me.type) != -1){
                        return;
                    }
                    scope.showBanner = scope.getCookie() == null;

                    const lang = conf().Platform.idiom;
                    scope.icon = lang.translate("smartbanner.icon.uri");
                    if (scope.showBanner) {
                        if (/Android/i.test(navigator.userAgent)) {
                            scope.store = lang.translate("smartbanner.android.store");
                            scope.appRef = lang.translate("smartbanner.android.uri");
                        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                            scope.store = lang.translate("smartbanner.ios.store");
                            scope.appRef = lang.translate("smartbanner.ios.uri");
                        } else {
                            scope.showBanner = false;
                        }
                    }
                }
            }catch(e){
                //dont display smart banner
            }
        }

        scope.init();    
    }
}

/**
 * The smartBanner directive.
 *
 * Usage:
 *   &lt;smart-banner ></smart-banner&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
