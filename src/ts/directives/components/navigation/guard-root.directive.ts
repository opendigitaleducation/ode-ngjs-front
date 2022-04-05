import { IAttributes, IController, IDirective, IRootScopeService, IScope } from "angular";
import { AngularJSRouteChangeListener, DOMRouteChangeListener, INavigationGuard, navigationGuardService } from "../../../utils/navigation-guard";

export class Controller implements IController {
    rootID: string = "";

    registerGuard(guard: INavigationGuard) {
        navigationGuardService.registerGuard(this.rootID, guard);
    }
    unregisterGuard(guard: INavigationGuard) {
        navigationGuardService.unregisterGuard(this.rootID, guard);
    }
    reset() {
        navigationGuardService.reset(this.rootID);
    }
}

type Scope = IScope & {
    "guardRoot": string
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
    restrict = 'A';
    scope = {
        guardRoot: "@?"
    }
    controller = [Controller];
    require = ['guardRoot'];

    link(scope:Scope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) return;
        ctrl.rootID = scope.guardRoot ?? navigationGuardService.generateID();

        let angularRCL = AngularJSRouteChangeListener.getInstance(scope.$root);
        navigationGuardService.registerListener(angularRCL);
        navigationGuardService.registerListener(DOMRouteChangeListener.getInstance());
//        navigationGuardService.registerListener(TemplateRouteChangeListener.getInstance());

        scope.$on("$destroy", function () {
            navigationGuardService.unregisterListener(angularRCL);
            navigationGuardService.unregisterListener(DOMRouteChangeListener.getInstance());
//            navigationGuardService.unregisterListener(TemplateRouteChangeListener.getInstance());
            navigationGuardService.unregisterRoot(ctrl.rootID);
        });
    }
}

/**
 * Usage:
 * 
 * &lt;div  navigation-trigger="doSomethingUsefulWhenNavigationConfirmed()" 
 * 
 *   navigation-trigger-param="{onEvent:['click','focus'], confirmMessageKey:'my.msg.key', rootGuardId:'myGuardId'}"&gt;
 * 
 * &lt;/div&gt; 
 * 
 * @param navigation-trigger-param [optional]
 * @values onEvent to specify one or more event that effectively trigger the guard,
 * Set confirmMessageKey to set a i18n for the confirm dialog message,
 * Set rootGuardId to trigger only the guard with specified the ID (useful when nesting guards).
 */
export function DirectiveFactory() {
	return new Directive();
}
