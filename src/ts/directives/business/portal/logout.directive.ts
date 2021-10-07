import { IAttributes, IController, IDirective, IScope } from "angular";
import { conf } from "../../../utils";

export class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';

    async link(scope:IScope, elem:JQLite, attr:IAttributes, controllers?:IController[]): Promise<void> {
        elem.attr('href', '/auth/logout?callback=' + conf().Platform.theme.logoutCallback);
    }
}

export function DirectiveFactory() {
	return new Directive();
}