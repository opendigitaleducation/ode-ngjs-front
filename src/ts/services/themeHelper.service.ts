import angular from "angular";
import { ConfigurationFrameworkFactory, IThemeDesc, WidgetName } from "ode-ts-client";
import { NgHelperService } from "./ngHelper.service";
import $ from 'jquery';

/**
 * Helper service providing theme-related common tasks.
 */
export class ThemeHelperService {
    static $inject =["odeNgHelperService"];

    private iconOfWidget:{[name in WidgetName]:string} = {
        "last-infos-widget":    "ic-app actualites",
        "birthday":             "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "calendar-widget":      "ic-app calendar",
        "carnet-de-bord":       "ic-carnet-de-bord",
        "record-me":            "ic-microphone",
        "mood":                 "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "my-apps":              "ic-apps",
        "notes":                "ic-app notes",
        "rss-widget":           "ic-rss",
        "bookmark-widget":      "ic-signets",
        "qwant":                "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "qwant-junior":         "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "agenda-widget":        "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "cursus-widget":        "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "maxicours-widget":     "ic-star",        // FIXME obviously wrong => create missing icon in CSS
        "school-widget":        "ic-star",        // FIXME obviously wrong => create missing icon in CSS
    }

    constructor( 
        private ngHelperSvc:NgHelperService
    ) {
    }

    /** Get the configured CDN URL root. */
    get CDN() {
        return ConfigurationFrameworkFactory.instance().Platform.cdnDomain;
    }

    /** Return the path URL to the active theme, for example : /assets/themes/ode-bootstrap-neo */
    async getBootstrapThemePath():Promise<string> {
        const theme = ConfigurationFrameworkFactory.instance().Platform.theme.themeName;
        const conf = await ConfigurationFrameworkFactory.instance().Platform.theme.getConf();
        for( let override of conf.overriding ) {
            if( override.child === theme ) {
                return `${this.CDN}/assets/themes/${override.bootstrapVersion}`;
            }
        }
        return `${this.CDN}/assets/themes/${theme}`;
    }

    /* Extracted from an old code base. */
    toSkinUrl( url:string ):string {
        const theme = angular.element(document.querySelectorAll("#theme"));
        if(!theme.attr('href')) {
            return "";
        }
        const path = ConfigurationFrameworkFactory.instance().Platform.theme.basePath;
        if(url.indexOf('http://') === -1 && url.indexOf('https://') === -1 && url.indexOf('/workspace/') === -1){
            return path + url;
        } else {
            return url;
        }
    }
    
    /** 
     * Remove current theme and load and apply a new one.
     * THIS IS A LEGACY FEATURE and should not be used anymore.
     */
    loadOldWrappedTheme( oldTheme:string, skinName:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        $("#themeOld").remove();
        const style = angular.element(
            `<link rel="stylesheet" 
                type="text/css" 
                href="${platform.cdnDomain}/assets/themes/${oldTheme}/skins/${skinName}/wrapped.theme.css?version=${platform.deploymentTag}"
                id="themeOld"
                crossorigin="anonymous" />`
        );
        $('head').append( style );
    }

    /** Load the JS of a derived theme (skin) */
    loadThemeJs( theme:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        $("#themeJS").remove();
        const style = angular.element(
            `<script
                type="text/javascript"
                src="${platform.cdnDomain}/assets/themes/${theme}/js/theme.js?version=${platform.deploymentTag}"
                id="themeJS" />`
        );
        $('body').append(style);
    }

    /** Apply a theme from its URL */
    applyStyle( stylePath:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        if(stylePath && stylePath.startsWith("/")){
            stylePath = platform.cdnDomain + stylePath;
        }
        if($('#theme').length === 0) {
            const style = angular.element(
                `<link rel="stylesheet" 
                    type="text/css" 
                    href="${stylePath}theme.css?version=${platform.deploymentTag}"
                    id="theme"
                    crossorigin="anonymous" />`
            );
            var favicon = angular.element(
                `<link rel="icon"
                    href="${platform.theme.basePath}img/illustrations/favicon.ico" />`
            );
            style.on('load', e => {
                $('body').show();
            });
            $('head')
                .append(style)
                .append(favicon);
            setTimeout(function () {
                $('body').show();
            }, 300);
        }
        else {
            $('#theme').attr('href', stylePath + 'theme.css');
        }
    }

    /** @return list of available derived themes (skins) for the user. */
    listThemes():Promise<IThemeDesc[]> {
        return ConfigurationFrameworkFactory.instance().Platform.theme.listThemes();
    }

    /** Apply a derived theme (skin) and save it as prefered. */
    setTheme( theme:IThemeDesc ) {
        this.applyStyle( theme.path );
        ConfigurationFrameworkFactory.instance().Platform.theme.setDefaultTheme( theme );
    }

    /** @return the CSS class of a widget */
    getWidgetIconClass( name:WidgetName ):string {
        return this.iconOfWidget[name];
    }
}

/*
// Depuis theme.ts

declare var jQuery:any;

export const themeService = {
    loadOldWrappedTheme(oldTheme:string, skinName:string){
        let version = 'dev';
        if((window as any).springboardBuildDate){
            version = (window as any).springboardBuildDate;
        }
        jQuery("#themeOld").remove();
        const style = jQuery('<link>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: (window as any).CDN_DOMAIN+`/assets/themes/${oldTheme}/skins/${skinName}/wrapped.theme.css?version=${version}`,
            id: 'themeOld'
        }).attr("crossorigin", "anonymous");
        jQuery('head').append(style);
    },
    loadThemeJs(theme:string){
        let version = 'dev';
        if((window as any).springboardBuildDate){
            version = (window as any).springboardBuildDate;
        }
        jQuery("#themeJS").remove();
        const style = jQuery('<script>', {
            type: 'text/javascript',
            src: (window as any).CDN_DOMAIN+`/assets/themes/${theme}/js/theme.js?version=${version}`,
            id: 'themeJS'
        });
        jQuery('body').append(style);
    }
}

// Depuis ui.ts :
setStyle: function (stylePath:string) {
    if(stylePath && stylePath.startsWith("/")){
        stylePath = (window as any).CDN_DOMAIN + stylePath;
    }
    if ($('#theme').length === 0) {
        let version = 'dev';
        if((window as any).springboardBuildDate){
            version = (window as any).springboardBuildDate;
            console.log('Springboard built on ' + version);
        }

        var style = $('<link>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: stylePath + 'theme.css?version=' + version,
            id: 'theme'
        }).attr("crossorigin", "anonymous");
        var favicon = $('<link>', {
            rel: 'icon',
            href: skin.basePath + 'img/illustrations/favicon.ico'
        });
        style.on('load', function () {
            $('body').show();
        });
        $('head')
            .append(style)
            .append(favicon);
        setTimeout(function () {
            $('body').show();
        }, 300);
    }
    else {
        $('#theme').attr('href', stylePath + 'theme.css');
    }
},  

*/