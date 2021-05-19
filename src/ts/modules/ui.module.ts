import angular from "angular";
import { Portal, Navbar } from "../directives";

angular.module("odeUi", [])
.directive("odePortal", Portal.DirectiveFactory)
.directive("odeNavbar", Navbar.DirectiveFactory)
;
