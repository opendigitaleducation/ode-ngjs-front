import angular, { IModule } from "angular";
import { Portal, Navbar, WithTheme, Popover, PopoverContent, PopoverOpener, Logout, WidgetContainer, Widget, AppTitle, Pulsar, Assistant, Lightbox, SmartBanner, Modal, ModalContainer, Infotip, Autocomplete, Recorder, SkinSrc, ConnectorLightbox, Help, BindHtml, Xiti } from "../directives";
import { QuickstartService, ThemeHelperService, WidgetService, RichContentService } from "../services";

const dndLists = require('angular-drag-and-drop-lists');

const module = angular.module("odeUi", ['dndLists']);

/**
 * The "odeUi" angularjs module provides many UX components (directives) and useful services.
 */
 export function odeUiModule():IModule {
    return module
    .directive("odePortal", Portal.DirectiveFactory)
    .directive("odeNavbar", Navbar.DirectiveFactory)
    .directive("withTheme", WithTheme.DirectiveFactory)
    .directive("odeModal", Modal.DirectiveFactory)
    .directive("odeModalContainer", ModalContainer.DirectiveFactory)
    .directive("odeInfotip", Infotip.DirectiveFactory)

    .directive("appTitle", AppTitle.DirectiveFactory)
    .directive("logout", Logout.DirectiveFactory)
    .directive("popover", Popover.DirectiveFactory)
    .directive("popoverContent", PopoverContent.DirectiveFactory)
    .directive("popoverOpener", PopoverOpener.DirectiveFactory)
    .directive("assistant", Assistant.DirectiveFactory)
    .directive("pulsar", Pulsar.DirectiveFactory)
    .directive("lightbox", Lightbox.DirectiveFactory)
    .directive("connectorLightbox", ConnectorLightbox.DirectiveFactory)
    .directive("connectorLightboxTrigger", ConnectorLightbox.TriggerDirectiveFactory)
    .directive("smartBanner", SmartBanner.DirectiveFactory)
    .directive("help", Help.DirectiveFactory)
    .directive("bindHtml", BindHtml.DirectiveFactory)
    .directive("xiti", Xiti.DirectiveFactory)

    .directive("autocomplete", Autocomplete.DirectiveFactory)
    .directive("skinSrc", SkinSrc.DirectiveFactory)

    .directive("odeRecorder", Recorder.DirectiveFactory)

    .directive("odeWidgetContainer", WidgetContainer.DirectiveFactory)
    .directive("odeWidget", Widget.DirectiveFactory)

    .service("odeThemeHelperService", ThemeHelperService )
    .service("odeQuickstartService", QuickstartService )
    .service("odeWidgetService", WidgetService )
    .service("odeRichContentService", RichContentService )
    ;
 }