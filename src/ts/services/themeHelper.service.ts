import angular from "angular";
import { ConfigurationFrameworkFactory, IThemeDesc } from "ode-ts-client";
import { NgHelperService } from "./ngHelper.service";

export class ThemeHelperService {
    static $inject =["odeNgHelperService"];

    constructor( 
        private ngHelperSvc:NgHelperService
    ) {}

    get CDN() {
        return ConfigurationFrameworkFactory.instance().Platform.cdnDomain;
    }

    loadOldWrappedTheme( oldTheme:string, skinName:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        this.ngHelperSvc.querySelect("#themeOld").remove();
        const style = angular.element(
            `<link rel="stylesheet" 
                type="text/css" 
                href="${platform.cdnDomain}/assets/themes/${oldTheme}/skins/${skinName}/wrapped.theme.css?version=${platform.deploymentTag}"
                id="themeOld"
                crossorigin="anonymous" />`
        );
        this.ngHelperSvc.querySelect('head').append( style );
    }

    loadThemeJs( theme:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        this.ngHelperSvc.querySelect("#themeJS").remove();
        const style = angular.element(
            `<script
                type="text/javascript"
                src="${platform.deploymentTag}/assets/themes/${theme}/js/theme.js?version=${platform.deploymentTag}"
                id="themeJS" />`
        );
        this.ngHelperSvc.querySelect('body').append(style);
    }

    applyStyle( stylePath:string ) {
        const platform = ConfigurationFrameworkFactory.instance().Platform;
        if(stylePath && stylePath.startsWith("/")){
            stylePath = platform.cdnDomain + stylePath;
        }
        if(this.ngHelperSvc.querySelect('#theme').length === 0) {
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
                //FIXME this.ngHelperSvc.querySelect('body').show();
            });
            this.ngHelperSvc.querySelect('head')
                .append(style)
                .append(favicon);
            setTimeout(function () {
                //FIXME this.ngHelperSvc.querySelect('body').show();
            }, 300);
        }
        else {
            this.ngHelperSvc.querySelect('#theme').attr('href', stylePath + 'theme.css');
        }
    }

    listThemes():Promise<IThemeDesc[]> {
        return ConfigurationFrameworkFactory.instance().Platform.theme.listThemes();
    }

    setTheme( theme:IThemeDesc ) {
        this.applyStyle( theme.path );
        ConfigurationFrameworkFactory.instance().Platform.theme.setDefaultTheme( theme );
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