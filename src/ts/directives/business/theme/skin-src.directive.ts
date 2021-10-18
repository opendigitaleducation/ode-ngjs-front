import { IAttributes, IController, IDirective, IScope } from "angular";
import { ThemeHelperService } from "../../../services/theme-helper.service";

export class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	restrict = 'A';

	link($scope:IScope, $element:JQLite, $attributes:IAttributes, controllers?:IController[]) {
		$attributes.$observe('skinSrc', () => {
			$element.attr('src', this.helperSvc.toSkinUrl($attributes.skinSrc) );
		});
	}

	constructor( 
		private helperSvc:ThemeHelperService
	) {}
}

export function DirectiveFactory(odeThemeHelperService:ThemeHelperService) {
	return new Directive(odeThemeHelperService);
}
DirectiveFactory.$inject=["odeThemeHelperService"];
