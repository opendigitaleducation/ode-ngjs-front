import angular from "angular";
import { DominoFolder, DominoItem, Explorer, Folder, Modal, ResourceList, Sidebar, Toaster } from "../directives";

angular.module("odeExplorerModule", [])
.directive("odeExplorer", Explorer.DirectiveFactory)
.directive("odeSidebar", Sidebar.DirectiveFactory)
.directive("odeFolder", Folder.DirectiveFactory)
.directive("odeResourceList", ResourceList.DirectiveFactory)
.directive("odeDominoFolder", DominoFolder.DirectiveFactory)
.directive("odeDominoItem", DominoItem.DirectiveFactory)
.directive("odeToaster", Toaster.DirectiveFactory)
.directive("odeModal", Modal.DirectiveFactory)
;
