import angular from "angular";
import { I18n, I18nFilter, I18nPlaceholder, I18nValue, Translate } from "../directives";
import { I18nService } from "../services";


/**
 * The "odeI18n" angularjs module is a replacement for the legacy infra-front's 'idiom' functionality, 
 * and many other directives/filters using it : <i18n>, {{key|i18n}}, <input i18nPlaceholder> and <input i18nValue>.
 */
angular.module("odeI18n", [])
.directive('translate', Translate.DirectiveFactory)
.directive('i18n', I18n.DirectiveFactory)
.directive('i18nValue', I18nValue.DirectiveFactory)
.directive('i18nPlaceholder', I18nPlaceholder.DirectiveFactory)
.filter('i18n', I18nFilter.FilterFactory)

.service("odeI18n", I18nService.ServiceFactory)
;
