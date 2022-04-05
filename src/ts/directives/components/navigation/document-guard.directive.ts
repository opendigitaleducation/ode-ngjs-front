import { IScope, IAttributes, INgModelController } from "angular";
import { InputGuard } from "../../../utils/navigation-guard";
import { GenericGuardDirective } from "./genericGuardDirective";

type Element = {
    _id?: string;
}

class Directive extends GenericGuardDirective {
    protected guardFactory(scope: IScope, element: JQLite, attrs: IAttributes, ngModel: INgModelController) {
        return new InputGuard<Element>(
            () => typeof ngModel.$modelValue == "object" ? ngModel.$modelValue.id || "" : "",
            () => typeof ngModel.$modelValue == "object" ? ngModel.$modelValue.id || "" : "",
            (a, b) => {
                if (a && b) {
                    return a._id == b._id;
                } else {
                    return !a && !b;
                }
            }
        );
    }
}

/**
 * Usage:
 * 
 * &lt;input document-guard ng-model="myModel">
 */
 export function DirectiveFactory() {
	return new Directive();
}
