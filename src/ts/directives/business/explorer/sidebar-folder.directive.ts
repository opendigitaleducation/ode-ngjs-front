import { IAttributes, IController, IDirective, IRootScopeService, IScope } from "angular";
import { ID } from "ode-ts-client";
import { ExplorerModel, FolderModel } from "../../../stores/explorer.model";

type OnSelectParam = {folderCtrl:FolderController};

/* Controller for the directive */
export class FolderController implements IController {
    folderModel?:FolderModel = null as unknown as FolderModel;

    public expanded:boolean = false;

    // Shortcut for updating the view.
	public requestUpdate?:()=>void;

    get hasChildren():boolean {
        if( this.folderModel )
            return this.folderModel.folder.childNumber > 0;
        return false;
    }

    select() {
        this.expanded = true;
        this.model.openFolder( this.folderModel?.folder )
        .then( r => {
            this.requestUpdate?.call(this);
        });
    }

    constructor(
        public model:ExplorerModel
    ) {}
}

type Scope = IScope & {
    folderId:ID;
    onSelect:(param:OnSelectParam)=>void;
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	templateUrl = require('./sidebar-folder.directive.lazy.html').default;
	scope = {
        folderId:"<odeSidebarFolder",
        onSelect:"&"
    };
	controller = ["odeExplorerModel", FolderController];
	controllerAs = 'ctrl';
    require=["odeSidebarFolder"];

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:FolderController = controllers[0] as FolderController;

        ctrl.folderModel = ctrl.model.getFolderModel( scope.folderId );
        if( ! ctrl.folderModel ) throw 'Bad folder model';
        // Auto-expand default folder when linked
        if( scope.folderId==='default' ) {
            ctrl.expanded = true;
        }
		ctrl.requestUpdate = () => {
			this.$rootScope.$applyAsync();
		};
	}

    constructor(
		private $rootScope:IRootScopeService
    ) {}
}

/** The folder directive.
 * 
 * Usage (pseudo-code):
 *      &lt;div ode-sidebar-folder="IFolder" on-select="selectFolderCallback(OnSelectParam)"></div&gt;
 */
 export function DirectiveFactory($rootScope:IRootScopeService) {
	return new Directive($rootScope);
}
DirectiveFactory.$inject = ["$rootScope"];
