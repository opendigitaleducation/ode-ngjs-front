import { IAttributes, IController, IDirective, IScope } from "angular";
import { GetResourcesResult, IContext, IExplorerContext } from "ode-ts-client";
import { FolderController } from "./folder.directive";

/* Controller for the directive */
export class Controller implements IController {
	explorer?: IExplorerContext;

	get context():IContext|undefined {
		return this.explorer?.getContext();
	}

	onSelectFolder(folderCtrl:FolderController):void {
		if( this.explorer ) {
			this.explorer.getSearchParameters().filters.folder = folderCtrl.folder?.id;
			this.explorer.getResources().then( (result:GetResourcesResult) => {
				folderCtrl.subfolders = result.folders;
			});
		}
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {
		explorer:"<context"
	};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The sidebar directive.
 *
 * Usage:
 *      &lt;ode-sidebar explorer="instance of IExplorerContext"></ode-sidebar&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
