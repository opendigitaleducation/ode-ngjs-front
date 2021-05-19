import angular, { IInterpolateProvider } from "angular";
import { SessionService, UserService } from "../services";

/**
 * The "odeBase" angularjs module adds basic initialization to other modules.
 */
angular.module( "odeBase", 
    ['ngSanitize', 'ngRoute'], 
    ['$interpolateProvider', function($interpolateProvider:IInterpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}])
.service("odeSession", SessionService.ServiceFactory)
.service("odeUser", UserService.ServiceFactory)
;
