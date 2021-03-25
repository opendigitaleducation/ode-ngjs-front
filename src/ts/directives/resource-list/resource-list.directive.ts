import { IAttributes, IController, IDirective, IScope } from "angular";
import { IFolder, IResource, ISearchResults } from "ode-ts-client";
import { Subscription } from "rxjs";
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

    onClickFolder( folder:IFolder ){
        alert( folder.name );
    }

    onClickItem( item:IResource ){
        alert( item.name );
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'A';
	template = require('./resource-list.directive.html').default;
	scope = {
		model:"<"
    };
	bindToController = true;
    transclude = {
        folders: "odeListFolder",
        items:   "odeListItem"
    };
	controller = [Controller];
	controllerAs = 'ctrl';

     link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller = controller as Controller;
        let subscription:Subscription|null = null;
        
        scope.$watch(attr['model'], (newVal,oldVal)=>{
            if( newVal && !subscription ) {
                // Subscribe to the flow of resultset
                subscription = ctrl.model.explorer.latestResources().subscribe({
                    next: resultset => { 
                        ctrl?.display(resultset);
                        scope.$apply();
                    }
                }) ?? null;
            }
        });

        scope.$on('$destroy', (ev)=>{
            if( subscription ) {
                subscription.unsubscribe();
                subscription = null;
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
