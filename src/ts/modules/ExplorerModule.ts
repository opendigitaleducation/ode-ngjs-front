import angular from "angular";
import { Explorer, Folder, Sidebar } from "../directives";

angular.module("odeExplorerModule", [])
.directive("odeExplorer", Explorer.DirectiveFactory)
.directive("odeSidebar", Sidebar.DirectiveFactory)
.directive("odeFolder", Folder.DirectiveFactory)
;
