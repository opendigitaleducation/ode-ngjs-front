import { ICompileService } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

export abstract class I18nBase {
    constructor(protected $compile:ICompileService) {
    }
    
    get idiom() {
        return ConfigurationFrameworkFactory.instance().Platform.idiom;
    }
}
