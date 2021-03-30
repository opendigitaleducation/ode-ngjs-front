import angular from "angular";
import { entcore } from "../legacy/entcore";

//TODO Code non-fonctionnel
/**
 * This angularjs module is a replacement for the legacy infra-front's 'idiom' functionality, 
 * and many directives/filters using it : <i18n>, {{key|i18n}}, <input i18nPlaceholder> and <input i18nValue>.
 * Use it when infra-front is not available.
 */
angular.module("odeLegacyModule", [])
/*
.directive('translate', ['$compile', function($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function(scope, element, attributes) {
            if(attributes.params){
                var params = scope.$eval(attributes.params);
                for(var i = 0; i < params.length; i++){
                    scope[i] = params[i];
                }
            }

            attributes.$observe('content', function(val) {
                if(!attributes.content){
                    return;
                }
                element.html($compile('<span class="no-style">' + idiom.translate(attributes.content) + '</span>')(scope));
            });

            attributes.$observe('attr', function(val) {
                if(!attributes.attr){
                    return;
                }
                var compiled = $compile('<span>' + idiom.translate(attributes[attributes.attr]) + '</span>')(scope);
                setTimeout(function(){
                    element.attr(attributes.attr, compiled.text());
                }, 10);
            });

            attributes.$observe('attributes', function(val){
                if(!attributes.attributes){
                    return;
                }
                var attrObj = scope.$eval(attributes.attributes);
                for(var prop in attrObj){
                    var compiled = $compile('<span>' + idiom.translate(attrObj[prop]) + '</span>')(scope);
                    setTimeout(function(){
                        element.attr(prop, compiled.text());
                    }, 0);
                }
            })

            attributes.$observe('key', function(val) {
                if(!attributes.key){
                    return;
                }
                element.html($compile('<span class="no-style">' + idiom.translate(attributes.key) + '</span>')(scope));
            });
        }
    };
}])

.directive('i18n', ['$compile', function($compile){
    return {
        restrict: 'E',
        link: function(scope, element, attributes){
            element.html($compile('<span class="no-style">' + idiom.translate(element.text().trim()) + '</span>')(scope));
        }
    }
}])

.filter('i18n', function() {
    return function(input:string) {
        return idiom.translate(input);
    };
})

.directive('i18nPlaceholder', ['$compile', function($compile){
    return {
        link: function(scope, element, attributes){
            attributes.$observe('i18nPlaceholder', function(val) {
                var compiled = $compile('<span>' + idiom.translate(attributes.i18nPlaceholder) + '</span>')(scope);
                setTimeout(function(){
                    element.attr('placeholder', compiled.text());
                }, 10);
            });
        }
    }
}])

.directive('i18nValue', ['$compile', function($compile){
    return {
        link: function(scope, element, attributes){
            attributes.$observe('i18nValue', function(val) {
                var compiled = $compile('<span>' + idiom.translate(attributes.i18nValue) + '</span>')(scope);
                setTimeout(function(){
                    element.attr('value', compiled.text());
                }, 10);
            });
        }
    }
}])
*/
/*
.filter('odeI18n', function() {
    return function(input:string) {
        return entcore.idiom.translate(input);
    };
})
*/
;
