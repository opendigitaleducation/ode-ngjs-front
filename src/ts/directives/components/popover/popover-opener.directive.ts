import angular, { IAttributes, IController, IDirective, IScope } from "angular";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	require= '^popover';
	link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		const parentNode = (tag => {
			tag = tag.toUpperCase();
			let parent:HTMLElement = elem[0];
			do {
				parent = parent.parentNode as HTMLElement;
			} while( parent && parent.nodeName.toUpperCase()!==tag );
			return parent ? angular.element(parent) : elem;
		})('popover');

		const mouseEvent = parentNode.attr('mouse-event') || 'mouseover';
		const popover = parentNode.find('popover-content');
		parentNode.on(mouseEvent, function (e) {
			if (mouseEvent === 'click') {
				if (popover.hasClass('hidden')) {
					e.stopPropagation();
				}

				angular.element(document.querySelector('body') as HTMLBodyElement).one('click', function (e) {
					parentNode.triggerHandler('close');
					popover.addClass("hidden");
				});
			}
			/*FIXME without jQuery */
			const coords = popover.offset();
			const w = popover.width() || 0;		const ww = $(window).width() || 0;
			const h = popover.height() || 0;	const wh = $(window).width() || 0;
			if( coords ) {
				if(coords.left + w > ww){
					popover.addClass('right');
				}
				if(coords.left < 0){
					popover.addClass('left');
				}
				if(coords.top + h > wh){
					popover.addClass('bottom');
				}
			}
			popover.removeClass("hidden");
		});

		if(mouseEvent === 'mouseover') {
			parentNode.on('mouseout', function (e) {
				parentNode.triggerHandler('close');
				popover.addClass("hidden");
			});
		}
	}
}

/** The popover-opener directive.
 *
 * Usage:
 *      &lt;popover>&lt;button popover-opener/>&lt;popover-content>&lt;/popover-content></popover&gt;
 */
 export function DirectiveFactory() {
	return new Directive();
}