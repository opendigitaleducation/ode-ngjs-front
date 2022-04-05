import { IAttributes, IController, IDirective, INgModelController, IScope } from "angular";
import { GuardRoot } from "../..";
import { INavigationGuard, navigationGuardService } from "../../../utils/navigation-guard";

/* Directive */
export abstract class GenericGuardDirective implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    require= ['?ngModel', '?^^guardRoot'];
    restrict= 'A';

    /** To be implemented by subclasses. */
    protected abstract guardFactory(scope:IScope, element:JQLite, attrs:IAttributes, ngModel:INgModelController|null): INavigationGuard;

    link(scope:IScope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ngModel = controllers ? controllers[0] as INgModelController : null;
        const root = controllers ? controllers[0] as GuardRoot.Controller : null;

        const guard = this.guardFactory(scope, element, attrs, ngModel);
        let count = 0;
        if (guard != null) {
            if (ngModel != null) {
                ngModel.$formatters.push((value) => {
                    if (count == 0) {
                        setTimeout(() => guard.reset());
                        count++;
                    }
                    return value;
                });
            } else {
                setTimeout(() => guard.reset());
            }
            if (root != null) {
                root.registerGuard(guard);
                scope.$on("$destroy", function () {
                    root.unregisterGuard(guard);
                });
            }
            else {
                let id: string = navigationGuardService.registerIndependantGuard(guard);
                scope.$on("$destroy", function () {
                    navigationGuardService.unregisterIndependantGuard(id);
                });
            }
        }
    }
}
