import { IAttributes, IController, IDirective, IScope } from "angular";
import { NgHelperService, NotifyService, QuickstartService } from "../../../services";
import $ from "jquery"; // FIXME : remove jQuery dependency 

/* Controller for the directive */
export class Controller implements IController {
    constructor(
        public quickstart:QuickstartService
        ) {
    }

    show = { assistant: false };
    steps:any;
    token?:NodeJS.Timeout;
    currentStep:any;

    public hidePulsars = () => {
        $('.pulsar-button').addClass('hidden');
        //this.token = setTimeout(this.hidePulsars, 50);
        // cache TOUS les pulsars
    }

    private clearTimeout() {
        if( this.token ) {
            clearTimeout(this.token);
        }        
    }

    goTo(step:any){
        this.quickstart.goTo(step.index);
        this.currentStep = this.quickstart.assistantIndex;
    };

    next(){
        this.quickstart.nextAssistantStep();
        this.currentStep = this.quickstart.assistantIndex;
        if(!this.quickstart.assistantIndex){
            this.show.assistant = false;
            $('.pulsar-button').removeClass('hidden');
            this.clearTimeout();
        }
    };

    previous(){
        this.quickstart.previousAssistantStep();
        this.currentStep = this.quickstart.assistantIndex;
    };

    seeLater(){
        this.show.assistant = false;
        $('.pulsar-button').removeClass('hidden');
        this.clearTimeout();
        this.quickstart.seeAssistantLater();
    };

    closeAssistant(){
        this.show.assistant = false;
        $('.pulsar-button').removeClass('hidden');
        this.clearTimeout();
        this.quickstart.state.assistant = -1;
        this.quickstart.save();
    };    
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	templateUrl = require("./assistant.directive.lazy.html").default;
    scope= true;
	bindToController = true;
	controller = ["odeQuickstartService", Controller];
	controllerAs = 'ctrl';
	require = ['assistant'];

    link(scope:IScope, elem:JQLite, attr:IAttributes, controllers:IController[]|undefined): void {
        let ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        
		if( !ctrl || this.helperSvc.viewport <= this.helperSvc.FAT_MOBILE ) {  /* TODO contrôle à appliquer à l'aide d'une directive ?*/
			return;
		}

        ctrl.quickstart.load( () => {
            if( ctrl ) {
                if(ctrl.quickstart.state.assistant === -1 || ctrl.quickstart.mySteps.length === 0){
                    return;
                }
                ctrl.hidePulsars();
                ctrl.show.assistant = true;
                ctrl.currentStep = ctrl.quickstart.assistantIndex;
                ctrl.steps = ctrl.quickstart.mySteps;
                scope.$apply();
            }
        });
    }

    /* Constructor with Dependency Injection */
    constructor(
        private helperSvc:NgHelperService
        ) {
    }
}

/**
 * The assistant directive.
 *
 * Usage:
 *   &lt;assistant ></assistant&gt;
 */
export function DirectiveFactory(
	odeNgHelperService:NgHelperService, 
    ) {
	return new Directive(odeNgHelperService);
}
DirectiveFactory.$inject = ["odeNgHelperService"];
