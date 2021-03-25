import { IAttributes, IController, IDirective, IScope } from "angular";
import { IContext, IExplorerContext, IFolder, IResource, ISearchParameters, ISearchResults } from "ode-ts-client";
import { Subscription } from "rxjs";

/* Controller for the directive */
export class Controller implements IController {
    explorer?: IExplorerContext;
    folders:IFolder[] = [];
    items:IResource[] = [];

    get context():IContext|undefined {
		return this.explorer?.getContext();
	}

    display( resultset:ISearchResults ) {
        // If pagination starts at 0, this is a new resultset.
        if( resultset.pagination.startIdx===0) {
            this.folders = resultset.folders ?? [];
            this.items = resultset.resources ?? [];
        } else {
            this.items.concat( resultset.resources );
        }
    }

    onSelectFolder( folder:IFolder ){
        if( this.explorer ) {
            this.explorer.getSearchParameters().filters.folder = folder.id;
            this.explorer.getResources(); // Result will be display()ed when available.
        }
    }

    onSelectItem( item:IResource ){
        alert( item.name );
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'A';
	template = require('./resource-list.directive.html').default;
	scope = {
		explorer:"<context"
    };
	bindToController = true;
    transclude = {
        folders: "odeListFolder",
        items:   "odeListItem"
    };
	controller = [Controller];
	controllerAs = 'ctrl';

     link(scope:IScope, elem:JQLite, attr:IAttributes, controller:IController|undefined): void {
        let ctrl:Controller|null = controller ? controller as Controller : null;
        let subscription:Subscription|null = null;
        
        scope.$watch(attr['context'], (newVal,oldVal)=>{
            if( newVal && !subscription ) {
                subscription = ctrl?.explorer?.latestResources().subscribe({
                    next: (resultset) => { 
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
 *      &lt;div ode-resource-list context="instance of IExplorerContext">_Content to transclude here_</div&gt;
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
