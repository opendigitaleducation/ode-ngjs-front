import angular from "angular";
import { Explorer, Folder, ResourceList, Sidebar } from "../directives";

angular.module("odeExplorerModule", [])
.directive("odeExplorer", Explorer.DirectiveFactory)
.directive("odeSidebar", Sidebar.DirectiveFactory)
.directive("odeFolder", Folder.DirectiveFactory)
.directive("odeResourceList", ResourceList.DirectiveFactory)
;
