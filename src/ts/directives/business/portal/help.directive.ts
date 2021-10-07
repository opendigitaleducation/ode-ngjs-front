import { IAttributes, IDirective, IScope } from "angular";
import { ITheme } from "ode-ts-client";
import { conf, session, http } from "../../../utils";

/* The Help directive is tied to the old infra-front architecture, and relies on having data stored in the scope. */

interface Scope extends IScope {
    display:{read?:boolean};
    helpPath:string;
    onHelp:()=>void;
}

export class Directive implements IDirective<Scope,JQLite,IAttributes> {
    restrict = 'E';
    template = require('./help.directive.html').default;
    scope = {};

    async link(scope:Scope, element:JQLite, attributes:IAttributes) {
        const skin:ITheme = conf().Platform.theme;
        const appPrefix:string|null = session().currentApp;
        if( appPrefix===null ) {
            return;
        } 
        let helpPath = await skin.getHelpPath();
        let helpText:string;

        const lang = conf().Platform.idiom;

        scope.onHelp = function() {
            if (helpText) {
                setHtml(helpText);
            }
            else {
                http().get<string>(
                    scope.helpPath,
                    {queryParams:{"_": conf().Platform.deploymentTag}}
                ).then( content => {
                    if( http().latestResponse.status === 404 ) {
                        helpText = '<h2>' + lang.translate('help.notfound.title') + '</h2><p>' + lang.translate('help.notfound.text') + '</p>';
                    } else {
                        helpText = content;
                    }
                    setHtml(helpText);
                    scope.$apply();
                })
            }
        };

        // FIXME old code with jquery starts here, i won't rewrite it now.
        scope.display = {};
        scope.helpPath = helpPath + '/application/' + appPrefix + '/';
        if(appPrefix === '.' && window.location.pathname !== '/adapter') {
            scope.helpPath = helpPath + '/application/portal/';
        }
        else if(window.location.pathname === '/adapter'){
            scope.helpPath = helpPath + '/application/' + window.location.search.split('eliot=')[1].split('&')[0] + '/'
        }
        else if (window.location.pathname.includes("/directory/class-admin")){
            scope.helpPath = helpPath + '/application/parametrage-de-la-classe/';
        }

        let helpContent, burgerMenuElement:JQuery<HTMLElement>, burgerButtonElement;

        var setHtml = function(content:string){
            helpContent = $('<div>' + content + '</div>');
            // Swap ToC and introduction paragraphs
            helpContent.find('> p').prev().insertAfter(helpContent.find('> p'));
            helpContent.find('img').each(function(index, item){
                $(item).attr('src', scope.helpPath + "../.." + $(item).attr('src'));
            });
            element.find('ode-modal-body > div').html(helpContent.html());
            element.find('li a').on('click', function(e){
                element.find('.section').slideUp();
                $('div#' + $(e.target).attr('href')?.split('#')[1]).slideDown();
            });
            element.find('div.paragraph a').on('click', function(e){
                window.open($(e.target).closest('a').attr('href'), "_newtab" ); 
            });
            element.find('li a').first().click();

            // Activate hamburger menu on responsive
            element.find('#TOC').wrap('<div id="burger-menu" class="burger-menu"></div>');
            burgerMenuElement = element.find('#burger-menu');
            burgerMenuElement.prepend('<button id="burger-button" class="burger-button"><i class="burger-icon"></i></button>');
            burgerButtonElement = element.find('#burger-button');
            burgerButtonElement.click(function(e) {
                burgerMenuElement.toggleClass('active');
            }); 
            element.find('#TOC > ul li a').on('click', function (e) {
                burgerMenuElement.removeClass('active');
            });
            
            let bodyClick = function (event:any) {
                if (element.find('#TOC > ul').find(event.target).length == 0 
                    && burgerMenuElement.find(event.target).length == 0) {
                    burgerMenuElement.removeClass('active');
                }
            }
            $('body').on('click', bodyClick);
            scope.$on('$destroy', function () {
                $('body').off('click', bodyClick);
            });
            // end of hamburger

            scope.display.read = true;
            scope.$apply('display');
        };
    }
}

export function DirectiveFactory() {
	return new Directive();
}
