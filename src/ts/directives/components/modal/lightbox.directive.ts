import { IAttributes, IController, IDirective, IScope } from "angular";
import $ from "jquery"; // FIXME : remove jQuery dependency 

export interface LightboxDelegate{
	stayOpen():Promise<boolean>;
}
class LightboxDelegateWrapper implements LightboxDelegate{
	constructor(private all:Array<LightboxDelegate>) {}
	async stayOpen():Promise<boolean>{
		for(const current of this.all){
			if(current){
				const res = await current.stayOpen();
				if(res){
					return true;
				}
			}
		}
		return false;
	}

}

interface Scope extends IScope {
	show: boolean;
	tiny: string;
	onShow: any;
	onClose: any,
	delegate:any;
	delegateClose: (elem:any)=>boolean;
	backup: {overflow:any; zIndex:any};
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
	restrict= 'E';
	template = require("./lightbox.directive.html").default;
	transclude= true;
	scope= {
		show: '=',
		tiny: '=',
		onShow: '&?',
		onClose: '&',
		delegate:'=',
		delegateClose: '&?'
	};

	link(scope:Scope, element:JQLite, attributes:IAttributes, controllers:IController[]|undefined): void {
		let delegate:LightboxDelegate = scope.delegate;
		// FIXME
		// if(attributes.navigationGuard){
		// 	const guard = await import("../navigationGuard");
		// 	const guardListener =  new guard.LightboxChangeListener();
		// 	delegate = new LightboxDelegateWrapper([delegate,guardListener]);
		// 	guard.navigationGuardService.registerListener(guardListener);
		// 	scope.$on("$destroy", () => {
		// 		guard.navigationGuardService.unregisterListener(guardListener);
		// 	})
		// }
		element.children('.lightbox').find('> .background').on('click', async function(e){
			if (element.children('.lightbox').find('image-editor, share-panel, .import-files, .split-screen, [template=entcore\\/image-editor\\/main]').length === 0){
				if (delegate) {
					let result= await delegate.stayOpen();
					if(result===true){
						return;
					}
				}
				if (attributes.delegateClose) {
					let result= scope.delegateClose({ $element:element });
					if(result===true){
						return;
					}
				}
				element.children('.lightbox').first().fadeOut();
				$('body').css({ overflow: 'auto' });
				$('body').removeClass('lightbox-opened');

				scope.$eval(scope.onClose);
				scope.$apply();
				scope.show = false;
				if(!scope.$$phase){
					scope.$parent.$apply();
				}
			}
		});
		element.children('.lightbox').find('> .content > .close-lightbox > i.close-2x').on('click', async function(e){
			if (element.children('.lightbox').find('share-panel').length === 0){
				if (delegate) {
					let result= await delegate.stayOpen();
					if(result===true){
						return;
					}
				}
				if (attributes.delegateClose) {
					let result= scope.delegateClose({ $element:element });
					if(result===true){
						return;
					}
				}
				element.children('.lightbox').first().fadeOut();
				$('body').css({ overflow: 'auto' });
				$('body').removeClass('lightbox-opened');

				scope.$eval(scope.onClose);
				scope.$apply();
				scope.show = false;
				if(!scope.$$phase){
					scope.$parent.$apply();
				}
			}
		});
		element.children('.lightbox').on('mousedown', function(e){
			e.stopPropagation();
		});

		scope.$watch('show', function(newVal){
			if (newVal) {
				if (attributes.onShow) {
					scope.onShow({ $element:element });
				}
				element.trigger('lightboxvisible');
				var lightboxWindow = element.children('.lightbox');

				//Backup overflow hidden elements + z-index of parents
				var parentElements = element.parents();

				scope.backup = {
					overflow: parentElements.filter( (idx,parent) => {
						return $(parent).css('overflow-x') !== 'visible' || $(parent).css('overflow-y') !== 'visible';
					}),
					zIndex: parentElements.map( (idx,parent) => {
							var index = '';
							if($(parent).attr('style')?.indexOf('z-index') !== -1){
								index = $(parent).css('z-index')
							}
							return {
								element: $(parent),
								index: index
							}
						})
				};

				//Removing overflow properties
				scope.backup.overflow.forEach( (element:HTMLElement) => {
					$(element).css({ 'overflow': 'visible' })
				});

				//Ensuring proper z-index
				scope.backup.zIndex.forEach((elementObj:any) => {
					elementObj.element.css('z-index', 99999)
				})

				setTimeout(() => {
					if(element.parents('header.main').length === 0){
						$('body').addClass('lightbox-opened');
					}
					
					lightboxWindow.fadeIn();
				}, 100);

				$('body').css({ overflow: 'hidden' });
			}
			else {
				let updateBody = true;
				$('lightbox .lightbox').each((index, item) => {
					if(item !== element.children('.lightbox')[0] && $(item).css('display') === 'block'){
						updateBody = false;
					}
				});

				if(updateBody){
					$('body').removeClass('lightbox-opened');
					$('body').css({ overflow: 'auto' });
				}

				if(scope.backup){
					//Restoring stored elements properties
					scope.backup.overflow.forEach((element:HTMLElement) => {
						$(element).css('overflow', '')
					})
					scope.backup.zIndex.forEach((elementObj:any) => {
						elementObj.element.css('z-index', elementObj.index)
					})
				}

				element.children('.lightbox').fadeOut();
			}
		});

		scope.$on("$destroy", function () {
			if(element.parents('lightbox').length){
				return;
			}
			$('body').removeClass('lightbox-opened');
			$('body').css({ overflow: 'auto' });

			if (scope.backup) {
				//Restoring stored elements properties
				scope.backup.overflow.forEach( (element:HTMLElement) => {
					$(element).css('overflow', '');
				});
				scope.backup.zIndex.forEach( (elementObj:any) => {
					elementObj.element.css('z-index', elementObj.index)
				});
			}
		});
	}
}

/** The lightbox directive.
 *
 * Usage: //TODO
 *      &lt;lightbox ></lightbox&gt;
 */
 export function DirectiveFactory() {
	return new Directive();
}
