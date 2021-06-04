import angular, { IModule } from "angular";
import { Portal, Navbar, WithTheme, Popover, PopoverContent, PopoverOpener, Logout, WidgetContainer, Widget } from "../directives";
import { ThemeHelperService, WidgetService } from "../services";

const module = angular.module("odeUi", []);

/**
 * The "odeUi" angularjs module provides many UX components (directives) and useful services.
 */
 export function odeUiModule():IModule {
    return module
    .directive("odePortal", Portal.DirectiveFactory)
    .directive("odeNavbar", Navbar.DirectiveFactory)
    .directive("withTheme", WithTheme.DirectiveFactory)
    .directive("logout", Logout.DirectiveFactory)
    .directive("popover", Popover.DirectiveFactory)
    .directive("popoverContent", PopoverContent.DirectiveFactory)
    .directive("popoverOpener", PopoverOpener.DirectiveFactory)

    .directive("odeWidgetContainer", WidgetContainer.DirectiveFactory)
    .directive("odeWidget", Widget.DirectiveFactory)

    .service("odeThemeHelperService", ThemeHelperService )
    .service("odeWidgetService", WidgetService )
    ;
 }