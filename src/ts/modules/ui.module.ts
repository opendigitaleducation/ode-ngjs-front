import angular from "angular";
import { Portal, Navbar, WithTheme, Popover, PopoverContent, PopoverOpener } from "../directives";
import { ThemeHelperService } from "../services";

angular.module("odeUi", [])
.directive("odePortal", Portal.DirectiveFactory)
.directive("odeNavbar", Navbar.DirectiveFactory)
.directive("withTheme", WithTheme.DirectiveFactory)
.directive("popover", Popover.DirectiveFactory)
.directive("popoverContent", PopoverContent.DirectiveFactory)
.directive("popoverOpener", PopoverOpener.DirectiveFactory)

.service("odeThemeHelper", ThemeHelperService )
;
