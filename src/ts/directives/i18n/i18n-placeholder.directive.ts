import angular from "angular";

/*
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
*/