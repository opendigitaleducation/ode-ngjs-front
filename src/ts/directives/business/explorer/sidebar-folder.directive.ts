import { IAttributes, IController, IDirective, IScope } from "angular";
import { ID, IFolder } from "ode-ts-client";
import { ExplorerModel, FolderModel } from "../../../stores/explorer.model";

type OnSelectParam = {folder:IFolder};

/* Controller for the directive */
export class FolderController implements IController {
    folderModel?:FolderModel = null as unknown as FolderModel;
    highlightFolder?:IFolder;
    onSelect?:(param:OnSelectParam)=>void;

    public expanded:boolean = false;

    get hasChildren():boolean {
        if( this.folderModel )
            return this.folderModel.folder.childNumber > 0;
        return false;
    }

    select() {
        this.expanded = true;
        this.folderModel && this.onSelect && this.onSelect({folder:this.folderModel.folder});
    }

    constructor(
        public model:ExplorerModel
    ) {}
}

type Scope = IScope & {
    folderId:ID;
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
	templateUrl = require('./sidebar-folder.directive.lazy.html').default;
	scope = {
        folderId:"<odeSidebarFolder"
    };
    bindToController = {onSelect: "&",highlightFolder:"="};
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
	}

}

/** The sidebar folder directive.
 * 
 * Usage (pseudo-code):
 *      &lt;div ode-sidebar-folder="aFolderId" selected-folder="anIFolder" on-select="selectFolderCallback(OnSelectParam)"></div&gt;
 */
 export function DirectiveFactory() {
	return new Directive();
}
