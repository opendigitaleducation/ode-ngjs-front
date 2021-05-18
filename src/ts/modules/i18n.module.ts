import angular from "angular";
import { Translate } from "../directives";

/**
 * The "odeI18n" angularjs module is a replacement for the legacy infra-front's 'idiom' functionality, 
 * and many other directives/filters using it : <i18n>, {{key|i18n}}, <input i18nPlaceholder> and <input i18nValue>.
 */
angular.module("odeI18n", [])
.directive('translate', Translate.DirectiveFactory)
;
