import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { IUserInfo } from "ode-ts-client";
import { conf, notif, session, http } from "../../utils";
import $ from "jquery"; // FIXME : remove jQuery dependency 

/* Controller for the directive */
class Controller implements IController {
    // Shortcut for refreshing the view.
    public apply?: () => void;
    controllerData:{
        id?:any;
        connectorEndpoint?:string;
        userInfo?:{
            hasAnActiveAccount: string;
            activityScore: string;
            hasSessionOfTheDay: string;
            sessionOfTheDayUrl: string;
            sessionOfTheDayActivities: Array<any|string>;
            hasPersonnalCourses: string;
            newPersonnalCourses: Array<any|string>;
            currentPersonnalCourses: Array<any|string>;
        };
    } = {};
    loads:boolean = false;

    private get version(): string {
        return conf().Platform.deploymentTag;
    }
    private get me(): IUserInfo {
        return session().user;
    }

    showWidget() {
        return this.me.type === 'ELEVE';
    }

    loading(mode:boolean) {
        this.loads = mode;
        this.apply && this.apply();
    }

    authProcess(hook?: any) {
        this.getUserStatus().then( () => this.getUserInfo(hook) );
    }

    initAuthProcess() {
        const delay = 2000;
        let countdown = 5;
        this.loading(true);
        const timeoutFunction = () => {
            if (this.controllerData.id < 0 && countdown-- > 0) {
                this.authProcess();
                setTimeout(timeoutFunction, delay);
            } else {
                this.loading(false);
            }
        }
        setTimeout(timeoutFunction, delay);
    }

    getConf() {
        return http().get('/maxicours/conf', { queryParams: { "_": this.version } })
        .then( data => {
            if( http().latestResponse.status !== 200 ) {
                throw "Cannot get maxicours widget configuration.";
            }
            Object.assign( this.controllerData, data );
            if( this.controllerData.connectorEndpoint ) {
                $("[data-maxicours-action]").attr("action", this.controllerData.connectorEndpoint );
                $("[data-maxicours-href]").attr("href", this.controllerData.connectorEndpoint );
            }
        })
        .catch( () => {
            console.log('HTTP error on /maxicours/conf. aide-aux-devoirs widget will not load.');
        });
    }

    getUserStatus() {
        return http().get<string>('/maxicours/getUserStatus', { queryParams: { "_": this.version } })
        .then( xml => {
            if( http().latestResponse.status !== 200 ) {
                throw "Cannot get maxicours user status.";
            }
            const xmlDocument = $.parseXML(xml);
            const $xml = $(xmlDocument);

            this.controllerData.id = $xml.find("mxcId").text()
            this.apply && this.apply();
        })
        .catch( () => {
            console.log('HTTP error on /maxicours/getUserStatus. aide-aux-devoirs widget  will not load.');
        });
    }

    getUserInfo(hook?:any) {
        if (typeof this.controllerData.id === "undefined"
            || (typeof this.controllerData.id === "string" && this.controllerData.id.trim().length === 0)
            || this.controllerData.id < 0) {
            if (typeof hook === 'function')
                hook();
            return Promise.resolve();
        }

        http().get<string>('/maxicours/getUserInfo/' + this.controllerData.id)
        .then( xml => {
            if( http().latestResponse.status !== 200 ) {
                throw "Cannot get maxicours user info.";
            }
            try {
                const xmlDocument = $.parseXML(xml);
                const $xml = $(xmlDocument);

                let getText = function (xml:JQuery<XMLDocument>, tagName:string, parent?:string) {
                    const tags = parent ? xml.find(parent).find(tagName) : xml.find(tagName)
                    return tags.text()
                }
                let getContent = function (xml:JQuery<XMLDocument>, tagName:string, parent?:string) {
                    const tags = parent ? xml.find(parent).find(tagName) : xml.find(tagName)
                    return tags.contents()
                }
                let jsonifyArray = function(arrayTag:JQuery<HTMLElement>) {
                    return $(arrayTag).children().toArray().map( item => {
                        let serialized:any = {};
                        const children = $(item).children();
                        for (let i = 0; i < children.length; i++) {
                            serialized[children[i].nodeName] = children[i].textContent;
                        }
                        return serialized;
                    });
                }

                this.controllerData.userInfo = {
                    hasAnActiveAccount: getText($xml, "hasAnActiveAccount"),
                    activityScore: getText($xml, "activityScore"),
                    hasSessionOfTheDay: getText($xml, "hasSessionOfTheDay"),
                    sessionOfTheDayUrl: getText($xml, "sessionOfTheDayUrl"),
                    sessionOfTheDayActivities: jsonifyArray($xml.find("sessionOfTheDayActivities")),
                    hasPersonnalCourses: getText($xml, "hasPersonnalCourses"),
                    newPersonnalCourses: jsonifyArray($xml.find("newPersonnalCourses")),
                    currentPersonnalCourses: jsonifyArray($xml.find("currentPersonnalCourses"))
                }

                this.apply && this.apply();
            } catch (e) {
                console.log("Cannot parse maxicours user info.");
            }
        })
        .finally( () => {
            if (typeof hook === 'function')
                hook();
        });
    }

}

/* Directive */
class Directive implements IDirective<IScope, JQLite, IAttributes, IController[]> {
    restrict = 'E';
    template = require('./maxicours-widget.widget.html').default;
    controller = [Controller];
    controllerAs = 'ctrl';
    require = ['odeMaxicoursWidget'];

    link(scope: IScope, elem: JQLite, attrs: IAttributes, controllers?: IController[]): void {
        const ctrl: Controller | null = controllers ? controllers[0] as Controller : null;
        if (!ctrl) return;

        ctrl.apply = () => {
            scope.$apply();
        };

        ctrl.getConf()
        .then( () => ctrl.authProcess( () => {
            ctrl.loading( false );
            ctrl.apply && ctrl.apply();
        }));
    }
}

/** The maxicours-widget widget. */
function DirectiveFactory() {
    return new Directive();
}

// Preload translations
notif().onLangReady().promise.then(lang => {
    switch (lang) {
        default: conf().Platform.idiom.addKeys(require('./i18n/fr.json')); break;
    }
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeMaxicoursWidgetModule";
angular.module(odeModuleName, []).directive("odeMaxicoursWidget", DirectiveFactory);
