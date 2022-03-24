import { IAttributes, IController, IDirective, IScope } from "angular";
import { ExplorerModel } from "../../../stores/explorer.model";
import { NgHelperService } from '../../../services';

/* Controller for the directive */
export class Controller implements IController {
    // Shortcut for updating the view.
	public requestUpdate?:()=>void;

    constructor( public model:ExplorerModel ) {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	template = require('./resource-list.directive.html').default;
	scope = {};
	bindToController = true;
    transclude = {
        folders: "odeListFolder",
        items:   "odeListItem"
    };
	controller = ["odeExplorerModel", Controller];
	controllerAs = 'ctrl';
	require = ["odeResourceList"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
        const ctrl:Controller = controllers[0] as Controller;

        ctrl.requestUpdate = () => {
			this.helperSvc.safeApply( scope );
		};
        document.addEventListener( "explorer.view.updated", ctrl.requestUpdate );
        scope.$on('$destroy', ev=>{
            // @ts-ignore: just remove the customevent listener.
            document.removeEventListener( "explorer.view.updated", ctrl.requestUpdate );
        });
    }

    constructor(
        private helperSvc:NgHelperService
    ) {}
}

/** The ode-resource-list directive.
 * 
 * Usage (pseudo-code):
 *      &lt;div ode-resource-list context="instance of UiContext">_Content to transclude here_</div&gt;
 * The content to transclude can reference some scope values :
 * * Use _{{$parent.ctrl.xxx}}_ to access this directive's controller.
 * * Use _&lt;ode-list-folder>{{$parent.folder.xxx}}</ode-list-folder&gt;_
 *   where {{$parent.folder}} is an IFolder
 * * Use _&lt;ode-list-item>{{$parent.item.xxx}}</ode-list-folder&gt;_
 *   where {{$parent.item}} is an IResource
 * 
 */
export function DirectiveFactory(helperSvc: NgHelperService) {
	return new Directive(helperSvc);
}
DirectiveFactory.$inject = ["odeNgHelperService"];
