import { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";
import { ThemeHelperService } from "../../services/themeHelper.service";

const theme = ConfigurationFrameworkFactory.instance().Platform.theme;

export class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'EA';

    async link(scope:IScope, elem:JQLite, attr:IAttributes, controllers:IController[]|undefined): Promise<void> {
        const conf = await theme.getConf();
        await theme.onSkinReady();
        const themeName = theme.themeName;
        const skinName = theme.skinName;
        let url = theme.themeUrl;
        for(let theme of conf.overriding){
            //replace theme by bootstrap version
            if(theme.child===themeName && theme.bootstrapVersion){
                url = `${this.helperSvc.CDN}/assets/themes/${theme.bootstrapVersion}/skins/${skinName}/`;
                elem.addClass(theme.bootstrapVersion);//add class at root=>wrapped theme
                this.helperSvc.loadOldWrappedTheme(theme.child, skinName);
                this.helperSvc.loadThemeJs(theme.bootstrapVersion)
            }
        }
        this.helperSvc.setStyle(url);
    }

    constructor( 
            private helperSvc:ThemeHelperService
        ) {}
}

export function DirectiveFactory(odeThemeHelperService:ThemeHelperService) {
	return new Directive(odeThemeHelperService);
}
DirectiveFactory.$inject=["odeThemeHelper"];