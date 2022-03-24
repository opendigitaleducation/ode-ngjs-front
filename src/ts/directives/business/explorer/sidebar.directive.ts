import { IAttributes, IController, IDirective, IScope, ITimeoutService } from "angular";
import { IFolder } from "ode-ts-client";
import { NgHelperService } from "../../../services";
import { ExplorerModel } from "../../../stores/explorer.model";

/* Controller for the directive */
export class Controller implements IController {
	// To create a new folder
	_showNewFolder:boolean = false;
	get showNewFolder() { return this._showNewFolder }
	set showNewFolder( display:boolean ) {
		this._showNewFolder = display;
		if( display ) {
			this.$timeout(0).then( () => 
				document.getElementById("inputCreateFolderName")?.focus()
			);
		}
	}
	folderName = "";

    // Shortcut for updating the view.
	public requestUpdate?:()=>void;

	onSelect(folder:IFolder) {
        this.model.openFolder( folder )
//		.then( () => this.requestUpdate?.call(this) );
	}

	onCreate() {
		if( this.model.explorer && typeof this.folderName==="string" && this.folderName.trim().length ) {
			this.model.createFolder( this.folderName.trim() )
			.then( r => {
				this.folderName = "";
				this.showNewFolder = false;
//				this.requestUpdate?.call(this);
			});
		}
	}

    constructor(
		private $timeout:ITimeoutService,
		private model:ExplorerModel 
	) {}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./sidebar.directive.html').default;
	scope = {};
	replace = true
	bindToController = true;
	controller = ["$timeout", "odeExplorerModel", Controller];
	controllerAs = 'ctrl';
	require = ["odeSidebar"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
		const ctrl:Controller = controllers[0] as Controller;
		ctrl.requestUpdate = () => {
			this.helperSvc.safeApply( scope );
		};
        document.addEventListener( "explorer.view.updated", ctrl.requestUpdate );
        scope.$on('$destroy', ev=>{
            // @ts-ignore: just remove the customevent listener.
            document.removeEventListener( "explorer.view.updated", ctrl.requestUpdate );
        });
	}

    constructor(
		private helperSvc:NgHelperService
    ) {}
}

/** The sidebar directive.
 *
 * Usage:
 *      &lt;ode-sidebar></ode-sidebar&gt;
 */
export function DirectiveFactory(helperSvc:NgHelperService) {
	return new Directive(helperSvc);
}
DirectiveFactory.$inject = ["odeNgHelperService"];
