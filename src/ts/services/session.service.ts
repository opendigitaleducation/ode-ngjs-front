export class SessionService {
}

type IServiceConstructor = (new (...args: any[]) => SessionService);
export const ServiceFactory:angular.Injectable<IServiceConstructor> = SessionService;
