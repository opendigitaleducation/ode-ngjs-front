import { IAttributes, IDirective, IScope } from "angular";
import { XitiService } from "../../../services/xiti.service";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes> {
    restrict= 'E';
    scope= false;
    link(scope:IScope, elem:JQLite, attr:IAttributes): void {
        this.xitiSvc.runScript();
    }

    /* Constructor with Dependency Injection */
    constructor(private xitiSvc:XitiService) {
    }
}

/**
 * The xiti directive.
 *
 * Usage:
 *   &lt;xiti></xiti&gt;
 */
 export function DirectiveFactory(odeXiti:XitiService) {
	return new Directive(odeXiti);
}
DirectiveFactory.$inject = ["odeXiti"];
