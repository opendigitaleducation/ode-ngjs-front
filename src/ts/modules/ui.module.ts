import angular from "angular";
import { Portal, Navbar, WithTheme, Popover, PopoverContent, PopoverOpener, Logout, WidgetContainer } from "../directives";
import { ThemeHelperService, WidgetService } from "../services";

/**
 * The "odeUi" angularjs module provides many UX components (directives) and useful services.
 */
 angular.module("odeUi", [])
.directive("odePortal", Portal.DirectiveFactory)
.directive("odeNavbar", Navbar.DirectiveFactory)
.directive("withTheme", WithTheme.DirectiveFactory)
.directive("logout", Logout.DirectiveFactory)
.directive("popover", Popover.DirectiveFactory)
.directive("popoverContent", PopoverContent.DirectiveFactory)
.directive("popoverOpener", PopoverOpener.DirectiveFactory)
.directive("odeWidgetContainer", WidgetContainer.DirectiveFactory)


.service("odeThemeHelper", ThemeHelperService )
.service("odeWidget", WidgetService )
;
