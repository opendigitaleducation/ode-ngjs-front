import { IScope, IAttributes, INgModelController } from "angular";
import { InputGuard } from "../../../utils/navigation-guard";
import { GenericGuardDirective } from "./genericGuardDirective";

class Directive extends GenericGuardDirective {
    protected guardFactory(scope: IScope, element: JQLite, attrs: IAttributes, ngModel: INgModelController) {
        return new InputGuard<any>(() => ngModel.$viewValue || "", () => ngModel.$viewValue || "");
    }
}

/**
 * Usage:
 * 
 * &lt;input input-guard ng-model="myModel">
 */
 export function DirectiveFactory() {
	return new Directive();
}
