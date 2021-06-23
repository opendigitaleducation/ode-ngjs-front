import angular, { IModule } from "angular";
import { I18n, I18nFilter, I18nPlaceholder, I18nValue, I18nTitle, Translate } from "../directives";
import { I18nService } from "../services";

const module = angular.module("odeI18n", []);

/**
 * The "odeI18n" angularjs module is a replacement for the legacy infra-front's 'idiom' functionality, 
 * and many other directives/filters using it : <i18n>, {{key|i18n}}, <input i18n-placeholder="key"> and <input i18n-value="key">.
 */
export function odeI18nModule():IModule {
    return module
    .directive('translate', Translate.DirectiveFactory)
    .directive('i18n', I18n.DirectiveFactory)
    .directive('i18nValue', I18nValue.DirectiveFactory)
    .directive('i18nPlaceholder', I18nPlaceholder.DirectiveFactory)
    .directive('i18nTitle', I18nTitle.DirectiveFactory)
    .filter('i18n', I18nFilter.FilterFactory)

    .service("odeI18n", I18nService)
    ;
 }