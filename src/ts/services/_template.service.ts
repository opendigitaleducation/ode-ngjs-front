export class _TemplateService {
}

type IServiceConstructor = (new (...args: any[]) => _TemplateService);
export const ServiceFactory:angular.Injectable<IServiceConstructor> = _TemplateService;
