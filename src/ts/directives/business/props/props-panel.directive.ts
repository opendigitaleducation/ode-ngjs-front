import { IAttributes, IController, IDirective, IScope } from "angular";
import { IProperty, IResource, PROP_KEY } from 'ode-ts-client';

export class PropsPanelController implements IController {
    constructor() {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.item = null as unknown as IResource;
    }
    item:IResource;
    showTitle=false;
    showImage=false;
    showColor=false;
    showDescription=false;
    showUrl=false;

}

//-----------------------------------------------
//----------------- Directive -------------------
//-----------------------------------------------
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict= 'E';
    templateUrl= require('./props-panel.directive.lazy.html').default;
    scope= {
        item: "="
    };
	bindToController = true;
	controller = ["$scope", PropsPanelController];
	controllerAs = 'ctrl';
	require = ["odePropsPanel"];

    link(scope:IScope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		if( !controllers ) return;
        const ctrl:PropsPanelController = controllers[0] as PropsPanelController;

        scope.$watch<IProperty[]>('props', function (newValue:IProperty[], oldValue:IProperty[]) {
            if( newValue && newValue.length > 0 && newValue!==oldValue ) {
                newValue.forEach( p => {
                    switch(p.key) {
                        case PROP_KEY.COLOR:        ctrl.showColor=true; break;
                        case PROP_KEY.DESCRIPTION:  ctrl.showDescription=true; break;
                        case PROP_KEY.IMAGE:        ctrl.showImage=true; break;
                        case PROP_KEY.TITLE:        ctrl.showTitle=true; break;
                        case PROP_KEY.URL:          ctrl.showUrl=true; break;
                    }
                });
            }
        });

    }
}

/** The props-panel directive.
 *
 * Usage:
 *      &lt;props-panel item="IResource" props="Array&lt;IProperty&gt;"></props-panel&gt;
 */
 export function DirectiveFactory() {
	return new Directive();
}
