import angular, { IInterpolateProvider, IModule } from "angular";
import { NgHelperService, NotifyService, SessionService, TrackingService, notify, XitiService } from "../services";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const module = angular.module("odeBase", 
    ['ngSanitize', 'ngRoute'], 
    ['$interpolateProvider', function($interpolateProvider:IInterpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }])
    // FIX #WB-1330: Add $sce whitelist configuration to fix CDN template loading
    .config(['$sceDelegateProvider', function($sceDelegateProvider: any) {
		$sceDelegateProvider.resourceUrlWhitelist([
			// Allow same origin resource loads.
			'self',
			// Allow loading from our assets domain. **.
			ConfigurationFrameworkFactory.instance().Platform.cdnDomain + '/**'
        ])
    }]);

/**
 * The "odeBase" angularjs module provides basic initialization features to other modules (apps).
 */
export function odeBaseModule():IModule {
    return module
    .value( "notify", notify)
    .service("odeNotify", NotifyService)
    .service("odeNgHelperService", NgHelperService )
    .service("odeSession", SessionService)
    .service("odeTracking", TrackingService)
    .service("odeXiti", XitiService);
}
