import angular, { IModule } from "angular";
import { Portal, Navbar, WithTheme, Popover, PopoverContent, PopoverOpener, Logout, WidgetContainer, Widget, AppTitle, Pulsar, Assistant } from "../directives";
import { QuickstartService, ThemeHelperService, WidgetService } from "../services";

const module = angular.module("odeUi", []);

/**
 * The "odeUi" angularjs module provides many UX components (directives) and useful services.
 */
 export function odeUiModule():IModule {
    return module
    .directive("odePortal", Portal.DirectiveFactory)
    .directive("odeNavbar", Navbar.DirectiveFactory)
    .directive("withTheme", WithTheme.DirectiveFactory)

    .directive("appTitle", AppTitle.DirectiveFactory)
    .directive("logout", Logout.DirectiveFactory)
    .directive("popover", Popover.DirectiveFactory)
    .directive("popoverContent", PopoverContent.DirectiveFactory)
    .directive("popoverOpener", PopoverOpener.DirectiveFactory)
    .directive("assistant", Assistant.DirectiveFactory)
    .directive("pulsar", Pulsar.DirectiveFactory)
    

    .directive("odeWidgetContainer", WidgetContainer.DirectiveFactory)
    .directive("odeWidget", Widget.DirectiveFactory)

    .service("odeThemeHelperService", ThemeHelperService )
    .service("QuickstartService", QuickstartService )
    .service("odeWidgetService", WidgetService )
    ;
 }