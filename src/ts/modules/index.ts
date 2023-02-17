import { odeBaseModule } from "./base.module";
import { odeI18nModule } from "./i18n.module";
import { odeUiModule } from "./ui.module";
// import { odeExplorerModule } from "./explorer.module";
import { odeWidgetModule } from "./widgets.module";

/**
 * Utility class for retrieving the names of angularJS modules defined in this library,
 * so your own angularJS module can depends on them.
 *  
 * Usage :
 * 
    angular.module("app", [OdeModules.getBase(), OdeModules.getI18n(), OdeModules.getUi()])
    .controller("appCtrl", ['$scope', AppController])
    ...
 * 
 */
export abstract class OdeModules {
    /** Base module (required). Declares directives for user session management, async notifications... */
    static getBase():string {
        return odeBaseModule().name;
    };
    /** Internationalization module. Declares the directive &lt;i18n> and similar tools. */
    static getI18n():string {
        return odeI18nModule().name;
    };
    /** User Interface module. Declares all components for building UIs. */
    static getUi():string {
        return odeUiModule().name;
    };
    /** Widgets module : declares lazy loaded directives (widgets for the timeline) */
    static getWidgets():string {
        return odeWidgetModule().name;
    };
    /** Explorer module. Declares components for exploring assets from resource-producing apps. */
   /*  static getExplorer():string {
        return odeExplorerModule().name;
    }; */
}