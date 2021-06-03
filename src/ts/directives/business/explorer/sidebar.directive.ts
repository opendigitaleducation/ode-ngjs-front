import * as Explorer from './explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { GetResourcesResult } from "ode-ts-client";
import { UiModel } from "../../../models/ui.model";
import { FolderController } from "./sidebar-folder.directive";

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
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ["odeSidebar", "^^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
		ctrl.model = odeExplorer.model;
	}
}

/** The sidebar directive.
 *
 * Usage:
 *      &lt;ode-sidebar></ode-sidebar&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
