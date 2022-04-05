/* From infra-front, not used anymore

export const guardTriggerTemplate: Directive = ng.directive('guardTriggerTemplate', function () {
    return {
        require: ['?container', '?guardRoot'],
        restrict: "A",
        link: function (scope, element, attrs, requires) {
            const container = requires[0];
            const guardRoot = requires[1];
            const instance = TemplateRouteChangeListener.getInstance();

            if(guardRoot){
                instance.setTriggerByDefault(true);
                return;
            }

            let templateName = container.template;

            if (templateName == null)
                console.error("Container directive doesn't have a template attribute. Did its implementation change ?");
            else {
                instance.addTriggerContainer(templateName);
                scope.$on("$destroy", function () { instance.removeTriggerContainer(templateName); });
            }
        }
    };
});

*/