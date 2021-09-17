import { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const skin = ConfigurationFrameworkFactory.instance().Platform.theme;

export class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'A';

    async link(scope:IScope, elem:JQLite, attr:IAttributes, controllers?:IController[]): Promise<void> {
        elem.attr('href', '/auth/logout?callback=' + skin.logoutCallback);
    }
}

export function DirectiveFactory() {
	return new Directive();
}