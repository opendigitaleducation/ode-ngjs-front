import angular from "angular";
import { Portal, Navbar, WithTheme } from "../directives";
import { ThemeHelperService } from "../services";

angular.module("odeUi", [])
.directive("odePortal", Portal.DirectiveFactory)
.directive("odeNavbar", Navbar.DirectiveFactory)
.directive("withTheme", WithTheme.DirectiveFactory)

.service("odeThemeHelper", ThemeHelperService )
;
