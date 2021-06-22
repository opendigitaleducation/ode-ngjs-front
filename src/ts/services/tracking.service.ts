import angular, { IDocumentService, ILocationService, IScope } from "angular";
import { App, ConfigurationFrameworkFactory, IMatomoTrackingParams, SessionFrameworkFactory } from "ode-ts-client";

export class TrackingService {
    constructor( 
        private $document:IDocumentService, 
        private $location:ILocationService, 
        private $rootScope:IScope
        ) {
    }

    private hasOptedIn: boolean = false;

    trackApp( app:App ) {
        const analytics = ConfigurationFrameworkFactory.instance().Platform.analytics;
        analytics.parameters<IMatomoTrackingParams>("matomo").then( (params?) => {
            if( !params ) return;
            try {
                let _paq:any = (window as any)["_paq"] = (window as any)["_paq"] ?? [];
                _paq.push(['setRequestMethod', 'POST']);
                if( params.UserId )	    _paq.push(['setUserId', params.UserId]);
                if( params.Profile )	_paq.push(['setCustomDimension', 1, params.Profile]);
                if( params.School )		_paq.push(['setCustomDimension', 2, params.School]);
                if( params.Project )	_paq.push(['setCustomDimension', 3, params.Project]);
                /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function() {
                    _paq.push(['setTrackerUrl', params.url +'matomo.php']);
                    _paq.push(['setSiteId', params.siteId]);
                    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                    g.type='text/javascript'; g.async=true; g.src=params.url+'ode.js'; s.parentNode?.insertBefore(g,s);
                })();

                // Retrieve current optin value
                const thisTracker = this;
                _paq.push([function(this:any) { // The "this" parameter will be given by matomo. See typescript handbook https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function
                    thisTracker.hasOptedIn = !this.isUserOptedOut();
                    thisTracker.$rootScope.$digest();
                }]);

                if( params.detailApps ) {
                    const me = SessionFrameworkFactory.instance().session.user;

                    // Check the doNotTrack apps filter.
                    if( angular.isArray(params.doNotTrack) && angular.isArray(me.apps) ) {
                        // Retrieve app from current URL.
                        for( var i=0; i<me.apps.length; i++ ) {
                            if( me.apps[i] && me.apps[i].address && me.apps[i].name
                                && this.$location.absUrl().indexOf(me.apps[i].address) !== -1
                                && params.doNotTrack.indexOf(me.apps[i].name) !== -1 ) {
                                // Don't intercept calls to th template's engine, see below.
                                return;
                            }
                        }
                    }

                    // Build a virtual URL for this template
                    let url = this.$location.absUrl().split("#")[0];
                    this.trackPage( (this.$document[0] as Document).title, url );
                }
            } catch(e) {
                console.error('Invalid tracker object. Should look like {"siteId": 99999, "url":"http://your.matomo.server.com/"}"', e);
            }
        })
    }

    trackPage( title:string, url:string ) {
        ConfigurationFrameworkFactory.instance().Platform.analytics.parameters<IMatomoTrackingParams>("matomo")
        .then( (params?) => {
            if( params ) {
            // Then let's track single-page applications routes, too.
            var _paq = (window as any)["_paq"] = (window as any)["_paq"] || [];
            _paq.push(['setDocumentTitle', title]);
            _paq.push(['setCustomUrl', url]);
            _paq.push(['trackPageView']);
            }
        });
    }

    saveOptIn() {
        ConfigurationFrameworkFactory.instance().Platform.analytics.parameters<IMatomoTrackingParams>("matomo")
        .then( (params?) => {
            if( params ) {
                let _paq = (window as any)["_paq"] = (window as any)["_paq"] || [];
                _paq.push( this.hasOptedIn ? ['forgetUserOptOut'] : ['optUserOut'] );
            }
        });
    }
}

TrackingService.$inject=["$document", "$location", "$rootScope"];
