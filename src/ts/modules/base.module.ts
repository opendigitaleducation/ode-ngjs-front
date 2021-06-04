import angular, { IInterpolateProvider, IModule } from "angular";
import { SessionService, UserService } from "../services";

const module = angular.module("odeBase", 
    ['ngSanitize', 'ngRoute'], 
    ['$interpolateProvider', function($interpolateProvider:IInterpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }]
);

/**
 * The "odeBase" angularjs module provides basic initialization features to other modules (apps).
 */
export function odeBaseModule():IModule {
    return module
    .service("odeSession", SessionService)
    .service("odeUser", UserService);
}
