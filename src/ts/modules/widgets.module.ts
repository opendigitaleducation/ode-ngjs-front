import angular, { auto, IModule } from "angular";
import Calendar = require("../widgets/calendar-widget/calendar-widget");
import LastInfos = require("../widgets/last-infos-widget/last-infos-widget");

// ============ /!\ IMPORTANT /!\ ============
//
// By using require.ensure() to async load them, the ts-loader plugin will not bundle the widgets in the ode-ngjs-front package.
// See https://github.com/TypeStrong/ts-loader#code-splitting-and-loading-other-resources
// and the examples : 
// https://github.com/TypeStrong/ts-loader/blob/main/test/comparison-tests/codeSplitting
// https://github.com/TypeStrong/ts-loader/blob/main/test/comparison-tests/es6codeSplitting
//
// ===========================================
declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (
        dependencies: string[],
        callback: (require: <T>(path: string) => T) => void,
        errorCallback: (error:any) => void,
        chunkName: string
    ) => void;
};

//------------------------------------------------ Types
type KnownWidget = "calendar-widget" | "last-infos-widget";
export type WidgetLoader = (widgetName:String)=>Promise<void>;

//------------------------------------------------ Create an angular module and an external loader.
const module = angular.module("odeWidgets", [])

.factory('odeWidgetLoader', ['$injector', function($injector:auto.IInjectorService) {
    return async (widgetName:KnownWidget) => {
        // Load the widget, if known.
        switch( widgetName ) {
            case "calendar-widget": await loadCalendarWidgetModule().then( mod=>{ $injector.loadNewModules([mod]) }); break;
            case "last-infos-widget": await loadLastInfosWidgetModule().then( mod=>{ $injector.loadNewModules([mod]) }); break;
            default: throw `Unknown widget "${widgetName}"`;
        }
    };
}]);

/** Dynamically load the "last-infos" widget, which is packaged as a separate entries thanks to require.ensure(). */
function loadLastInfosWidgetModule() {
    return new Promise<string>( (resolve, reject) => {
        // Note: the following "require.ensure" function acts as a compiling directive for webpack, and cannot be variabilized.
        require.ensure(
            ["../widgets/last-infos-widget/last-infos-widget"],
            function(require) {
                var jsModule = <typeof LastInfos> require("../widgets/last-infos-widget/last-infos-widget");
                resolve( jsModule.odeModuleName );
            },
            function(error) {
                console.log(error);
                reject();
            },
            "widgets/last-infos-widget/last-infos-widget"
        );
    });
}

/** Dynamically load the "calendar" widget, which is packaged as a separate entries thanks to require.ensure(). */
function loadCalendarWidgetModule() {
    return new Promise<string>( (resolve, reject) => {
        // Note: the following "require.ensure" function acts as a compiling directive for webpack, and cannot be variabilized.
        require.ensure(
            ["../widgets/calendar-widget/calendar-widget"],
            function(require) {
                var jsModule = <typeof Calendar> require("../widgets/calendar-widget/calendar-widget");
                resolve( jsModule.odeModuleName );
            },
            function(error) {
                console.log(error);
                reject();
            },
            "widgets/calendar-widget/calendar-widget"
        );
    });
}

/**
 * The "odeWidgets" angularjs module is a placeholder for widgets directives.
 */
export function odeWidgetModule():IModule {
    return module;
}
