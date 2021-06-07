import { IAttributes, IController, IDirective, IScope } from "angular";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
    scope = {
    };
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['appTitle'];

    /**
     * Link method for the directive.
     * @see https://code.angularjs.org/1.7.9/docs/api/ng/service/$compile
     * @param $scope scope
     * @param $elem jqLite-wrapped element that this directive matches.
     * @param $attr hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
     * @param controllers Array of "require"d controllers : [ngModelCtrl]
     */
    link(scope:IScope, elem:JQLite, attr:IAttributes, controllers:IController[]|undefined): void {
        let ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        // NOTE : previous code to adapt if required:
        // elem.addClass('zero-mobile');
        // elem.find('h1').addClass('application-title');

        // function setHeader(){
        //     var header = $('app-title').html();
        //     var mobileheader = $('header.main .application-title');

        //     if(ui.breakpoints.checkMaxWidth("tablette")){
        //         if(!mobileheader.length)
        //             $('header.main').append($compile(header)(scope));
        //     } else {
        //         mobileheader.remove();
        //     }
        // }
        // setHeader();
        // $(window).on('resize', setHeader);

        // scope.$on("$destroy", function() {
        //     $('body').find('header.main .application-title').remove();
        // });
    }

    /* Constructor with Dependency Injection */
    constructor() {
    }
}

/**
 * The appTitle directive.
 *
 * Usage:
 *   &lt;h2 app-title>The title</h2&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
