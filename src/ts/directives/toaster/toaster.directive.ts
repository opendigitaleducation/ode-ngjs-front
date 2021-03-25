import { IController, IDirective } from "angular";
import { ACTION, IAction } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
	constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;

		// Following actions are not displayed in the toaster.
		// TODO Could be done in CSS
		this.actionFilter[ACTION.INITIALIZE]= true;
		this.actionFilter[ACTION.SEARCH]	= true;

		// Following actions have mobile-mode css specificities.
		// TODO Could be done in CSS
		this.mobileFilter[ACTION.OPEN]		= true;
		this.mobileFilter[ACTION.EXPORT]	= true;
		this.mobileFilter[ACTION.COMMENT]	= true;
		this.mobileFilter[ACTION.PRINT]		= true;
		this.mobileFilter[ACTION.PUBLISH]	= true;
	}
    model: UiModel;
	private actionFilter:{[actionId:string]:boolean} = {};
	private mobileFilter:{[actionId:string]:boolean} = {};
	visible?: boolean = true;

    getClass( action:IAction ):{[classname:string]: boolean} {
		return {
			"d-none": !this.visible
		};
	}

    getActionClass( action:IAction ):{[classname:string]: boolean} {
		let ret:{[classname:string]: boolean} = {
			"d-none": this.actionFilter[action.id]===true,
            "d-mobile-none": this.mobileFilter[action.id]===true
		};
		ret[`ode-action-${action.id}`] = true;
        return ret;
    }

	getI18n( action:IAction ): string {
		return action.id; // TODO i18n
	}

	activate( action:IAction ) {
		if( !action?.available )
			return;
		
		switch( action.id ) {
			case ACTION.DELETE: {
				this.model.explorer.delete( [], [] );
				break;
			};
		}
	}
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./toaster.directive.html').default;
	scope = {
		model:"<"
	};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The toaster directive.
 *
 * Usage:
 *      &lt;ode-toaster context="instance of IExplorerContext"></ode-toaster&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
