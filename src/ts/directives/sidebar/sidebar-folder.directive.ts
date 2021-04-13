import { IController, IDirective, IRootScopeService } from "angular";
import { IFolder } from "ode-ts-client";

type OnSelectParam = {folderCtrl:FolderController};

/* Controller for the directive */
export class FolderController implements IController {
	constructor(private $rootScope:IRootScopeService) {
		this.$rootScope = $rootScope;
	}
    folder?:IFolder;
    onSelect?:(param:OnSelectParam)=>void;

    private _isSelected:boolean = false;
    private _subfolders:IFolder[] = [];

    get isSelected():boolean {
        return this._isSelected;
    }

    get hasChildren():boolean {
        return (typeof this.folder==="object") && this.folder.childNumber > 0;
    }

    get showSubfolders():boolean {
        return this._isSelected && this._subfolders.length > 0;
    }

    get subfolders():IFolder[] {
        return this._subfolders;
    }

    set subfolders( subFolders:IFolder[] ) {
        this._subfolders = subFolders;
        this.$rootScope.$apply();
    }

    getClass():{[classname:string]: boolean} {
        return {
            active: this._isSelected
        };
    }

    toggle( open?:boolean ):void {
        this._isSelected = open ?? !this._isSelected;
        if( this._isSelected && typeof this.onSelect==="function") {
            this.onSelect( {folderCtrl:this} );
        }
    }
}

/* Directive */
class Directive implements IDirective {
    restrict = 'A';
	templateUrl = require('./sidebar-folder.directive.lazy.html').default;
	scope = {
        folder:"<odeSidebarFolder",
        onSelect:"&"
    };
	bindToController = true;
	controller = ["$rootScope",FolderController];
	controllerAs = 'ctrl';
}

/** The folder directive.
 * 
 * Usage (pseudo-code):
 *      &lt;div ode-sidebar-folder="IFolder" on-select="selectFolderCallback(OnSelectParam)"></div&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
