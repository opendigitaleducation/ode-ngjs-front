import * as Explorer from '../explorer/explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { ACTION, IAction, IProperty, IResource } from "ode-ts-client";
import { UiModel } from "../../models/ui.model";

/* Controller for the directive */
export class Controller implements IController {
	constructor( private $scope:IScope ) {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;

		// Following actions are not displayed in the toaster.
		// TODO Could be done in CSS
		this.actionFilter[ACTION.INITIALIZE]= true;
		this.actionFilter[ACTION.SEARCH]	= true;
		this.actionFilter[ACTION.UPD_PROPS] = true;

		// Following actions have mobile-mode css specificities.
		// TODO Could be done in CSS
		this.mobileFilter[ACTION.OPEN]		= true;
		this.mobileFilter[ACTION.EXPORT]	= true;
		this.mobileFilter[ACTION.COMMENT]	= true;
		this.mobileFilter[ACTION.PRINT]		= true;
		this.mobileFilter[ACTION.PUBLISH]	= true;
	}
    model: UiModel;
	private actionFilter:{[actionId:string]:boolean} = {};
	private mobileFilter:{[actionId:string]:boolean} = {};

	/** Flag to show/hide the properties lightbox */
	showProps:boolean  = false;
	/** Flag to show/hide the sharing lightbox */
	showShares:boolean = false;
	props?:IProperty[];
	items?:IResource[];

    getClass( action:IAction ):{[classname:string]: boolean} {
		return {
			"d-none": this.model.selectedFolders.length===0 && this.model.selectedItems.length===0
		};
	}

    getActionClass( action:IAction ):{[classname:string]: boolean} {
		let ret:{[classname:string]: boolean} = {
			"d-none": this.actionFilter[action.id]===true,
            "d-mobile-none": this.mobileFilter[action.id]===true
		};
		ret[`ode-action-${action.id}`] = true;
        return ret;
    }

	getI18nKey( action:IAction ): string {
		return `explorer.toaster.btn.${action.id}.label`;
	}

	activate( action:IAction ) {
		if( !action?.available )
			return;
		
		switch( action.id ) {
			case ACTION.DELETE: {
				this.model.explorer.delete( 
					this.model.selectedItems.map(i => i.id), 
					this.model.selectedFolders.map(f => f.id)
				);
			}
			break;

			case ACTION.MANAGE: {
				this.model.explorer.manageProperties( 
					this.model.resourceType,
					this.model.selectedItems
				).then( res => {
					if( res?.properties?.length > 0 ) {
						this.editProps( res.properties, this.model.selectedItems );
					}
				});
			}
			break;

			case ACTION.SHARE: {
				this.editShares( this.model.selectedItems );
			}
			break;
			
			default: alert( `"${action.id}" is not implemented.` );
		}
	}

	/**
	 * Display the properties lightbox.
	 * @param props props to display/edit
	 * @param items apply to these resources
	 */
	private editProps( props:IProperty[], items:IResource[] ) {
		this.props = props;
		this.items = items;
		this.showProps = true;
		//alert( "MANAGE="+this.showProps+" ("+this.props.map(p=>""+p.property+",")+") for items ["+this.items.map(i=>""+i.id+",")+"]" );
	}

	/**
	 * Close the properties lightbox.
	 */
	closeProps() {
		delete this.props;
		delete this.items;
		this.showProps=false
		this.$scope.$apply();
	}

	/**
	 * Display the sharing lightbox.
	 * @param items apply to these resources
	 */
	 private editShares( items:IResource[] ) {
		this.items = items;
		this.showShares = true;
	}

	/**
	 * Close the sharing lightbox.
	 */
	closeShares() {
		delete this.items;
		this.showShares=false
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./toaster.directive.html').default;
	scope = {};
	bindToController = true;
	controller = ["$scope", Controller];
	controllerAs = 'ctrl';
	require = ["odeToaster", "^^odeExplorer"];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( controllers ) {
			const ctrl:Controller = controllers[0] as Controller;
			const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
			ctrl.model = odeExplorer.model;
		}
	}
}

/** The toaster directive.
 *
 * Usage:
 *      &lt;ode-toaster context="instance of IExplorerContext"></ode-toaster&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
