import angular, { ICompileProvider, IDirectiveFactory, IModule } from "angular";
import Calendar = require("../widgets/calendar-widget/calendar-widget");

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

//---------------- Create an angular module.
const module = angular.module("odeWidgets", [])
.config( ["$compileProvider", async function($compileProvider:ICompileProvider) {
    // Dynamically load the widgets, which are packaged as a separate entries in webpack configuration.
    require.ensure(
        ["../widgets/calendar-widget/calendar-widget"],
        function(require) {
            var calendarModule = <typeof Calendar> require("../widgets/calendar-widget/calendar-widget");
            $compileProvider.directive("odeCalendarWidget", calendarModule.DirectiveFactory);
        },
        function(error) {
            console.log(error);
        },
        "widgets/calendar-widget/calendar-widget"
    );
}]);


/*
//---------------- Utilities
const registeredWidgets = ["calendar-widget"];

function toCamelCase(str:string) {
    const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;
    return str.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).
    replace(MOZ_HACK_REGEXP, 'Moz$1');
};
function fromCamelCase(str:string) {
    return str.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
};
*/


// registeredWidgets.forEach( widgetName => {
//     module.directive( toCamelCase(`ode-${widgetName}`), EmptyWidget.DirectiveFactory );
// });

/**
 * The "odeWidgets" angularjs module is a placeholder for widgets directives.
 */
export function odeWidgetModule( widgets?:string[] ):IModule {
    //loadWidget( registeredWidgets[0] );
    //module.directive( "odeCalendarWidget", CalendarWidget.DirectiveFactory);

    // TODO : all widgets
    return module;
    // return module.config(["$compileProvider", function($compileProvider:ICompileProvider) {
    //     require.ensure(["../widgets/calendar-widget/calendar-widget"], function(require) {
    //         var widget = <typeof DirectiveFactory>require(/* webpackChunckName: "calendar-widget" */"../widgets/calendar-widget/calendar-widget");
    //         $compileProvider.directive( "odeCalendarWidget", widget );
    //     });
    // }]);
}
/*
export async function loadWidget( widgetName:string ) {
    const camelCased = toCamelCase("ode-"+widgetName);
    module.config( function() {
        //We have to remove existing directives we want to replace, otherwise it breaks.
        module.decorator(camelCased, ['$delegate', function($delegate:any) {
            $delegate.shift();
            return $delegate;
        }]);
    });
    
    module.config(["$compileProvider", async function($compileProvider:ICompileProvider) {
        let factory:angular.IDirectiveFactory<angular.IScope, JQLite, angular.IAttributes, angular.IController>;
        switch(widgetName) {
            case "calendar-widget": factory = await loadCalendarWidget();
            default: factory = await loadCalendarWidget();
        }

        // Replace the empty widget directive.
        $compileProvider.directive( camelCased, factory );
    }]);
}
*/
/*
export function loadCalendarWidget():Promise<angular.IDirectiveFactory<angular.IScope, JQLite, angular.IAttributes, angular.IController>> {
    return new Promise<IDirectiveFactory>( (resolve, reject) => {
        try {
            // Dynamically load the widgets, which are packaged as a separate entries in webpack configuration.
            require.ensure(
                ["../widgets/calendar-widget/calendar-widget.ts"], 
                function(require) {
                    const widget = (require("../widgets/calendar-widget/calendar-widget.ts") as any).DirectiveFactory;
                    resolve( widget );
                },
                function(error) {
                    console.log(error);
                    reject();
                },
                "widgets/calendar-widget/calendar-widget"
            );
        } catch(e) {
            console.log(e);
            reject();
        }
    });
}
*/

/*
THE FOLLOWING DOES NOT WORK : the "ts-loader" webpack plugin will package the calendar-widget in ode-ngjs-front...

export async function loadWidget() {
    // Dynamically load the widgets, which are packaged as a separate entries in webpack configuration.
    const blah = await import( "../widgets/calendar-widget/calendar-widget" );
    module.directive( "odeCalendarWidget", blah.DirectiveFactory);
}
*/