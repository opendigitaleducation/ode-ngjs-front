import angular from "angular";
import { Folder, FolderExplorer, Sidebar } from "../directives";

angular.module("explorerModule", [])
.directive("folderExplorer", FolderExplorer.DirectiveFactory)
.directive("sidebar", Sidebar.DirectiveFactory)
.directive("folder", Folder.DirectiveFactory)
;
