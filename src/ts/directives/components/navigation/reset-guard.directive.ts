import { IAttributes, IController, IDirective, IScope } from "angular";
import { GuardRoot } from "../..";
import { navigationGuardService} from "../../../utils/navigation-guard";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    require= '?^guardRoot';
    restrict= 'A';
	link(scope:IScope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const root = controllers ? controllers[0] as GuardRoot.Controller : null;
        if( ! root ) return;
        let resetID = attrs.resetGuardId;
        const submit = async () => {
            const promise: Promise<any> = scope.$eval(attrs.resetGuard)
            if (promise instanceof Promise) {
                await promise;//reset if promise return success
            } else {
                console.warn("[resetGuard] result is not instance of Promise");
            }
            if (resetID != null && resetID != "") {
                navigationGuardService.reset(resetID);
            }
            else if (root != null) {
                root.reset();
            }
            else {
                console.warn("[resetGuard] A reset directive has no root, resetting all guards...");
                navigationGuardService.resetAll();
            }
        }
        const bind = () => {
            let event: string = attrs.resetGuardEvent;
            if(typeof event != "string" || !event.trim())
            {
                const tagname = (element.prop("tagName") as string || "").toLowerCase();
                if (tagname == "form") {
                    event = "submit";
                } else {
                    event = "click";
                }
            }

            element.on(event, submit);
            return () => element.off(event, submit);
        }
        const unbind = bind();
        scope.$on("$destroy", function () {
            unbind();
        });
    }
}

/**
 * Usage:
 * 
 *  &lt;div reset-guard="an expression returning a Promise" 
 * 
 *  reset-guard-id="a guard root ID to reset"
 */
export function DirectiveFactory() {
	return new Directive();
}
