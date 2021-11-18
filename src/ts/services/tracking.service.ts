import angular, { IDocumentService, ILocationService, IScope } from "angular";
import { App, IMatomoTrackingParams, ITrackingParams, IWebApp } from "ode-ts-client";
import { conf, session } from "../utils";

export class TrackingService {
    constructor( 
        private $document:IDocumentService, 
        private $location:ILocationService, 
        private $rootScope:IScope
        ) {
    }

    private hasOptedIn: boolean = false;

    private _params?:IMatomoTrackingParams;

    private async loadParams() {
        return this._params = await conf().Platform.analytics.parameters<IMatomoTrackingParams>("matomo");
    }

    trackApp( app:App ) {
        this.loadParams().then( params => {
            if( !params || !this.shouldTrackCurrentApp() ) return;
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
                    const me = session().user;

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
        });
    }

    trackPage( title:string, url:string ) {
        this.loadParams().then( params => {
            if( !params || !this.shouldTrackCurrentApp() ) return;

            // Then let's track single-page applications routes, too.
            var _paq = (window as any)["_paq"] = (window as any)["_paq"] || [];
            _paq.push(['setDocumentTitle', title]);
            _paq.push(['setCustomUrl', url]);
            _paq.push(['trackPageView']);
        });
    }

    willTrackEvent( eventName:string ): boolean {
        // /!\  This method should not be async so it uses this._params directly, and not loadParams(). 
        const params = this._params;
        if( !params ) return false;

        const apps = this.getCurrentMatchingApps();
        //check included first
        if( params.trackOnly && params.trackOnly.length > 0 ) {
            for(const app of apps) {
                if (params.trackOnly.indexOf(`${app.name}.${eventName}`) !== -1 || params.trackOnly.indexOf(`*.${eventName}`) !== -1) {
                    return true;
                }
            }
            //if not in whitelist return false
            return false;
        }
        //check excluded then
        if (params.doNotTrack instanceof Array && params.doNotTrack.length > 0) {
            for (const app of apps) {
                if (params.doNotTrack.indexOf(`${app.name}.${eventName}`) !== -1 || params.doNotTrack.indexOf(`*.${eventName}`) !== -1) {
                    return false;
                }
            }
        }
        //if not blacklist return true
        return true;
    }

    trackEvent( category:string, action:string, name?:string, value?:number ) {
        this.loadParams().then( params => {
            if( !params ) return;

            var _paq = (window as any)["_paq"] = (window as any)["_paq"] || [];
            let event:any[] = ['trackEvent',category,action];
            if( typeof name==="string" ) {
                name = name.trim();
                if( name.length > 0)
                    event.push( name );
            }
            if( typeof value==="number" )
                event.push( value );
            _paq.push(event);
        });
    }

    saveOptIn() {
        this.loadParams().then( params => {
            if( !params ) return;
            let _paq = (window as any)["_paq"] = (window as any)["_paq"] || [];
            _paq.push( this.hasOptedIn ? ['forgetUserOptOut'] : ['optUserOut'] );
        });
    }

    private shouldTrackCurrentApp(): boolean {
        // /!\  This method should not be async so it uses this._params directly, and not loadParams(). 
        const params = this._params;
        if( !params ) return false;

        if( params.doNotTrack ) {
            const apps = this.getCurrentMatchingApps();
            for (const app of apps) {
                if (params.doNotTrack.indexOf(app.name) !== -1) {
                    return false;
                }
            }
        }
        return true;
    }

    private getCurrentMatchingApps(): IWebApp[] {
        const all: IWebApp[] = [];
        const apps = session().user.apps;
        if (apps instanceof Array) {
            // Retrieve app from current URL.
            for (let i = 0; i < apps.length; i++) {
                const app = apps[i];
                if (app && app.address && app.name && location.href.indexOf(app.address) !== -1) {
                    all.push(app);
                }
            }
        }
        return all;
    }

    private shouldTrackEvent( params:ITrackingParams, eventName:string ): boolean {
        if( !params ) return false;
        const apps = this.getCurrentMatchingApps();
        //check included first
        if( params.trackOnly && params.trackOnly.length > 0 ) {
            for(const app of apps) {
                if (params.trackOnly.indexOf(`${app.name}.${eventName}`) !== -1 || params.trackOnly.indexOf(`*.${eventName}`) !== -1) {
                    return true;
                }
            }
            //if not in whitelist return false
            return false;
        }
        //check excluded then
        if (params.doNotTrack instanceof Array && params.doNotTrack.length > 0) {
            for (const app of apps) {
                if (params.doNotTrack.indexOf(`${app.name}.${eventName}`) !== -1 || params.doNotTrack.indexOf(`*.${eventName}`) !== -1) {
                    return false;
                }
            }
        }
        //if not blacklist return true
        return true;
    }
}

TrackingService.$inject=["$document", "$location", "$rootScope"];
