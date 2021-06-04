import { odeBaseModule } from "./base.module";
import { odeI18nModule } from "./i18n.module";
import { odeUiModule } from "./ui.module";
import { odeExplorerModule } from "./explorer.module";
import { odeWidgetModule } from "./widgets.module";

export abstract class OdeModules {
    static getBase():string {
        return odeBaseModule().name;
    };
    static getI18n():string {
        return odeI18nModule().name;
    };
    static getUi():string {
        return odeUiModule().name;
    };
    static getWidgets():string {
        return odeWidgetModule().name;
    };
    static getExplorer():string {
        return odeExplorerModule().name;
    };
}