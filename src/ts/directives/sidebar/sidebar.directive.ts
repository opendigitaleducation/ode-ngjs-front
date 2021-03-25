import { IController, IDirective } from "angular";
import { GetResourcesResult } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";
import { FolderController } from "./folder.directive";

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;
    }
    model: UiModel;

	onSelectFolder(folderCtrl:FolderController):void {
		this.model.searchParameters.filters.folder = folderCtrl.folder?.id;
		this.model.explorer.getResources().then( (result:GetResourcesResult) => {
			folderCtrl.subfolders = result.folders;
		});
	}
}

/* Directive */
class Directive implements IDirective {
    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {
		model:"<"
	};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
}

/** The sidebar directive.
 *
 * Usage:
 *      &lt;ode-sidebar context="instance of UiContext"></ode-sidebar&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
