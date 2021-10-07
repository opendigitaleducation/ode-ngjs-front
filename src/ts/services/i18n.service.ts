import { conf } from "../utils";

const idiom = conf().Platform.idiom;

export class I18nService {
    translate( key:string ) {
        return idiom.translate(key);
    }
}

// export type IServiceConstructor = (new (...args: any[]) => I18nService);
// export const ServiceFactory:angular.Injectable<IServiceConstructor> = I18nService;
