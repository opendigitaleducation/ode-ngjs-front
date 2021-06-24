import { IAttributes, ICompileService, IController, IDirective, IScope, ITimeoutService } from "angular";

/* Controller for the directive */
export class Controller implements IController {
    constructor(private $timeout:ITimeoutService) {
    }
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict= 'E';
    template = require("./autocomplete.directive.html").default;
    replace= true;
    scope= {
        options: '&',
        ngModel: '=',
        ngChange: '&',
        search: '=?'
    };
	bindToController = true;
	controller = ["$timeout", Controller];
	controllerAs = 'ctrl';
	require = ['autocomplete'];

    /**
     * Link method for the directive.
     * @see https://code.angularjs.org/1.7.9/docs/api/ng/service/$compile
     * @param $scope scope
     * @param $elem jqLite-wrapped element that this directive matches.
     * @param $attr hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
     * @param controllers Array of "require"d controllers : [ngModelCtrl]
     */
    link(scope:IScope, element:JQLite, attributes:IAttributes, controllers:IController[]|undefined): void {
        let ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if (attributes.autocomplete === 'off') {
            return;
        }
        // TODO : finish porting or rewrite ? See OLD CODE in comments below
    }

    /* Constructor with Dependency Injection */
    constructor(private $compile:ICompileService) {
    }
}

/**
 * The autocomplete directive.
 *
 * Usage:
 *   &lt;autocomplete 
 *          autocomplete="off"      // To deactivate it
 *          options="yourList" 
 *          ng-model="yourText" ng-change="anExpression"></autocomplete&gt;
 */
export function DirectiveFactory($compile:ICompileService) {
	return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];

/* OLD CODE
            var token;
            var dropDownContainer = element.find('[data-drop-down]');
            var linkedInput = element.find('input');
            scope.search = '';
            scope.translate = lang.translate;
            scope.limit = 6;
            scope.match = [];

            scope.increaseLimit = function(){
				scope.limit += 5;
				$timeout(function(){
					scope.setDropDownHeight()
				});
			};

            scope.setDropDownHeight = function () {
                var liHeight = 0;
                var max = Math.min(scope.limit, scope.match.length);
                dropDownContainer.find('li').each(function (index, el) {
                    liHeight += $(el).offsetHeight;

                    return index < max;
                })
                dropDownContainer.height(liHeight)
            };

            var placeDropDown = function () {
                if(!scope.match || scope.match.length === 0){
					dropDownContainer.height();
					dropDownContainer.addClass('hidden');
					scope.limit = 6;
					dropDownContainer.attr('style', '');
					return;
                }
                
                var pos = linkedInput.offset();
                var width = linkedInput.width() +
                    parseInt(linkedInput.css('padding-right')) +
                    parseInt(linkedInput.css('padding-left')) +
                    parseInt(linkedInput.css('border-width') || 1) * 2;
                var height = linkedInput.height() +
                    parseInt(linkedInput.css('padding-top')) +
                    parseInt(linkedInput.css('padding-bottom')) +
                    parseInt(linkedInput.css('border-height') || 1) * 2;

                pos.top = pos.top + height;
                dropDownContainer.offset(pos);
                dropDownContainer.width(width);
                scope.setDropDownHeight();
				setTimeout(function(){
					scope.setDropDownHeight()
				}, 100);

                token = requestAnimationFrame(placeDropDown);
            };

            scope.$watch('search', function (newVal) {
                if (!newVal) {
                    scope.match = [];
                    dropDownContainer.height("");
                    dropDownContainer.addClass('hidden');
                    return;
                }
                scope.match = _.filter(scope.options(), function (option) {
                    var words = newVal.split(' ');
                    return _.find(words, function (word) {
                        var formattedOption = lang.removeAccents(option.toString()).toLowerCase();
                        var formattedWord = lang.removeAccents(word).toLowerCase();
                        return formattedOption.indexOf(formattedWord) === -1
                    }) === undefined;
                });
                if (!scope.match || scope.match.length === 0) {
                    dropDownContainer.height("");
                    scope.limit = 6;
                    dropDownContainer.addClass('hidden');
                    return;
                }
                dropDownContainer.removeClass('hidden');
                cancelAnimationFrame(token);
                placeDropDown();
            });

            element.parent().on('remove', function () {
                cancelAnimationFrame(token);
                dropDownContainer.remove();
            });

            scope.$on("$destroy", function() {
                cancelAnimationFrame(token);
                dropDownContainer.remove();
            });

            dropDownContainer.detach().appendTo('body');

            dropDownContainer.on('click', 'li', function (e) {
                if($(e.target).hasClass('display-more')){
					return;
				}
				scope.limit = 6;
				dropDownContainer.attr('style', '');
                scope.ngModel = $(this).scope().option;
                scope.search = '';
                scope.$apply('ngModel');
                scope.$eval(scope.ngChange);
                scope.$apply('ngModel');
                dropDownContainer.addClass('hidden');
                cancelAnimationFrame(token);
            });

            var closeDropDown = function(e){
				if(element.find(e.target).length > 0 || dropDownContainer.find(e.target).length > 0){
					return;
				}
                scope.match = [];
				scope.$apply();
			};

			$('body').on('click', closeDropDown);
            dropDownContainer.attr('data-opened-drop-down', true);
        }
    }
}]);
*/