import { IScope, IAttributes, INgModelController } from "angular";
import { ObjectGuard } from "../../../utils/navigation-guard";
import { GenericGuardDirective } from "./genericGuardDirective";

class Directive extends GenericGuardDirective {
    protected guardFactory(scope: IScope, element: JQLite, attrs: IAttributes, ngModel: INgModelController) {
        const temp = new ObjectGuard(() => scope.$eval(attrs.customGuard));
        scope.$watch(function() {
            return scope.$eval(attrs.customGuard);
        }, function(){
            temp.reset();
        });
        return temp;
    }
}

/**
 * Usage:
 * 
 * &lt;div custom-guard="an expression returning an IObjectGuardDelegate instance">
 */
 export function DirectiveFactory() {
	return new Directive();
}
