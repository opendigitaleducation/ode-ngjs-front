import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { TransportFrameworkFactory } from "ode-ts-client";

/* Controller for the directive */
class Controller implements IController {
	lexicon:any = {};
	suggestions:string[] = [];
	selectedWord:string = "";

	openDefinition(){	
		window.open('https://www.dictionnairedelazone.fr/dictionary/lexical/' + this.lexicon[this.selectedWord], '_blank');
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./dicodelazone-widget.widget.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeDicodelazoneWidget'];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) {
            return;
		}
		TransportFrameworkFactory.instance().http.get('/assets/widgets/dicodelazone-widget/lexicon.json')
		.then( data => {
			ctrl.lexicon = data;
			ctrl.suggestions = Object.keys(data);
			scope.$apply();
		})
	}
}

/** The dicodelazone widget. */
function DirectiveFactory() {
	return new Directive();
}

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeDicodelazoneWidgetModule";
angular.module( odeModuleName, []).directive( "odeDicodelazoneWidget", DirectiveFactory );
