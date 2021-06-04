import angular, { IInterpolateProvider } from "angular";
import { NGJS_MODULE } from ".";
import { SessionService, UserService } from "../services";

/**
 * The "odeBase" angularjs module provides basic initialization features to other modules (apps).
 */
angular.module( NGJS_MODULE.BASE, 
    ['ngSanitize', 'ngRoute'], 
    ['$interpolateProvider', function($interpolateProvider:IInterpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}])
.service("odeSession", SessionService)
.service("odeUser", UserService)
;
