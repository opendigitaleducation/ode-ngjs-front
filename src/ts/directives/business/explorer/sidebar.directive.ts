import * as Explorer from './explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { SearchStore } from "../../../stores/search.store";
import { FolderController } from "./sidebar-folder.directive";
import { NgHelperService } from '../../../services';

/* Controller for the directive */
export class Controller implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as SearchStore;
    }
    model: SearchStore;
	display= {
		showNewFolder: false
	};
	folderName = "";

    // Shortcut for updating the view.
	public requestUpdate?:()=>void;

	onSelectFolder(folderCtrl:FolderController):void {
		this.model.searchParameters.filters.folder = folderCtrl.folder?.id;
		this.model.explorer.getResources()
		.then( result => {
			folderCtrl.subfolders = result.folders;
		});
	}

	onCreateFolder() {
		if( typeof this.folderName==="string" && this.folderName.trim().length ) {
			this.model.explorer.createFolder( this.model.resourceType, this.model.currentFolder?.id ?? "default", this.folderName.trim() )
			.then( r => {
				this.model.loadedFolders.push( r );
				return r;
			})
			.then( r => {
				this.display.showNewFolder = false;
				this.requestUpdate && this.requestUpdate();
			});
		}
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    constructor(
        private helperSvc:NgHelperService
    ) {}

    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {};
	replace = true
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ["odeSidebar", "^^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;

		ctrl.model = odeExplorer.model;
		ctrl.requestUpdate = () => {
			this.helperSvc.safeApply( scope );   // Force reevaluation of the recorder's field
		};
	}
}

/** The sidebar directive.
 *
 * Usage:
 *      &lt;ode-sidebar></ode-sidebar&gt;
 */
export function DirectiveFactory(helperSvc: NgHelperService) {
	return new Directive(helperSvc);
}
DirectiveFactory.$inject = ["odeNgHelperService"];
