import { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { NotifyService } from "../../services";

/* Controller for the directive */
export class Controller implements IController {
    constructor(private notify:NotifyService) {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	templateUrl = require("./assistant.directive.lazy.html").default;
    scope = {
    };
	bindToController = true;
	controller = ["odeNotify", Controller];
	controllerAs = 'ctrl';
	require = ['assistant'];

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
        // TODO Manipulate the DOM here with this.$compile()
        if($(window).width() <= ui.breakpoints.fatMobile){
            return;
        }

        scope.show = { assistant: false };

        var token;
        var hidePulsars = function(){
            $('.pulsar-button').addClass('hidden');
            token = setTimeout(hidePulsars, 50);
            // cache TOUS les pulsars
        }

        quickstart.load(function(){
            if(quickstart.state.assistant === -1 || quickstart.mySteps.length === 0){
                return;
            }

            hidePulsars();
            scope.show.assistant = true;
            scope.currentStep = quickstart.assistantIndex;
            scope.steps = quickstart.mySteps;
            scope.$apply();
        });

        scope.goTo = function(step){
            quickstart.goTo(step.index);
            scope.currentStep = quickstart.assistantIndex;
        };

        scope.next = function(){
            quickstart.nextAssistantStep();
            scope.currentStep = quickstart.assistantIndex;
            if(!quickstart.assistantIndex){
                scope.show.assistant = false;
                $('.pulsar-button').removeClass('hidden');
                clearTimeout(token);
            }
        };

        scope.previous = function(){
            quickstart.previousAssistantStep();
            scope.currentStep = quickstart.assistantIndex;
        };

        scope.seeLater = function(){
            scope.show.assistant = false;
            $('.pulsar-button').removeClass('hidden');
            clearTimeout(token);
            quickstart.seeAssistantLater();
        };

        scope.closeAssistant = function(){
            scope.show.assistant = false;
            $('.pulsar-button').removeClass('hidden');
            clearTimeout(token);
            quickstart.state.assistant = -1;
            quickstart.save();
        };
    }

    /* Constructor with Dependency Injection */
    constructor(private $compile:ICompileService) {
    }
}

/**
 * The assistant directive.
 *
 * Usage:
 *   &lt;assistant ></assistant&gt;
 */
export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];
