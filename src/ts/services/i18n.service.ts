export class I18nService {
}

type IServiceConstructor = (new (...args: any[]) => I18nService);
export const ServiceFactory:angular.Injectable<IServiceConstructor> = I18nService;
