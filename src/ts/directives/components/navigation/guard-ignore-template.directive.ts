/* From infra-front, not used anymore

export const guardIgnoreTemplate: Directive = ng.directive('guardIgnoreTemplate', function () {
    return {
        require: ['?container', '?guardRoot'],
        restrict: "A",
        link: function (scope, element, attrs, requires) {
            const container = requires[0];
            const guardRoot = requires[1];
            const instance = TemplateRouteChangeListener.getInstance();
            if(guardRoot){
                instance.setTriggerByDefault(false);
                return;
            }
            let templateName = container.template;

            if (templateName == null)
                console.error("Container directive doesn't have a template attribute. Did its implementation change ?");
            else {
                instance.addIgnoreContainer(templateName);
                scope.$on("$destroy", function () { instance.removeIgnoreContainer(templateName); });
            }
        }
    };
});
*/