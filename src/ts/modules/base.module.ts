import angular, { IInterpolateProvider } from "angular";

/**
 * The "odeBase" angularjs module adds basic initialization to other modules.
 */
angular.module( "odeBase", 
    ['ngSanitize', 'ngRoute'], 
    ['$interpolateProvider', function($interpolateProvider:IInterpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
