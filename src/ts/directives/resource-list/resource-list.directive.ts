import * as Explorer from '../explorer/explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { ISearchResults } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;
    }
    model: UiModel;

    display( resultset:ISearchResults ) {
        // If pagination starts at 0, this is a new resultset.
        if( resultset.pagination.startIdx===0) {
            this.model.loadedFolders = resultset.folders ?? [];
            this.model.loadedItems   = resultset.resources ?? [];
        } else {
            this.model.loadedItems.concat( resultset.resources );
        }
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
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ["odeResourceList", "^^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
        const ctrl:Controller = controllers[0] as Controller;
        const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
        ctrl.model = odeExplorer.model;

        let subscription = ctrl.model.explorer.latestResources().subscribe({
            next: resultset => { 
                ctrl?.display(resultset.output);
                scope.$apply();
            }
        });

        scope.$on('$destroy', (ev)=>{
            if( subscription ) {
                subscription.unsubscribe();
            }
        });
    }
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
export function DirectiveFactory() {
	return new Directive();
}
