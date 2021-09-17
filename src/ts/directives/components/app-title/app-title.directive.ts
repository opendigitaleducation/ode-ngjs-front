import { IAttributes, IController, IDirective, IScope } from "angular";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';

    link(scope:IScope, elem:JQLite, attr:IAttributes, controllers?:IController[]): void {
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
