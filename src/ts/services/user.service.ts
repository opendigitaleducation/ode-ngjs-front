export class UserService {
}

type IServiceConstructor = (new (...args: any[]) => UserService);
export const ServiceFactory:angular.Injectable<IServiceConstructor> = UserService;
