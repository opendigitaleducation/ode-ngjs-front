import angular, { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, SessionFrameworkFactory, TransportFrameworkFactory } from "ode-ts-client";
import { NgHelperService, QuickstartService } from "../../../services";
import $ from "jquery"; // FIXME : remove jQuery dependency 

/* Local types */
type PulsarInfos = {
	index:number, 
	i18n:string, 
	position:string, 
	className:string,
	workflow?:string,
	el?:HTMLElement,
	steps:PulsarInfos[],
	delta?:string,
	style?:{ 
		zIndex?:number
	}
};

/*
 *	Customized scope for the directive.
 *	Required for compatibility with old pulsar templates.
 */
interface Scope extends IScope {
	me?:{
		hasWorkflow(right:string):boolean;
	};
	pulsarInfos: PulsarInfos;
	closePulsar: ()=>void;
	paintPulsar: ()=>void;
	isLastStep: () => void;
	goTo: (step:PulsarInfos) => void;
	next: () => void;
	previous: () => void;
}

type XPosition = "center"|"left"|"right";
type YPosition = "center"|"top"|"bottom";

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
	restrict= 'A';
	scope= true;

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
		const idiom = ConfigurationFrameworkFactory.instance().Platform.idiom;
		const http = TransportFrameworkFactory.instance().http;

		if( !elem ) {
			return;
		}

		// Legacy code (angular templates in old format)
		scope.me = {
			hasWorkflow: SessionFrameworkFactory.instance().session.hasWorkflow
		};

		if( this.helperSvc.viewport <= this.helperSvc.TABLET ||  /* TODO contrôle à appliquer à l'aide d'une directive ?*/
			!scope.me.hasWorkflow('org.entcore.portal.controllers.PortalController|quickstart')){
			return;
		}

		const pulsarInfos:PulsarInfos = scope.$eval(attrs.pulsar);

		if( pulsarInfos.workflow && !scope.me.hasWorkflow(pulsarInfos.workflow) ) {
			elem.removeAttr('pulsar'); // ne remonte pas dans liste steps
			return;
		}
		/* FIXME code vraisemblablement buggé, à revoir : quelle était l'intention ?
		if(!scope.me.hasWorkflow(pulsarInfos.workflow)){
			elem.removeAttr('pulsar'); // ne remonte pas dans liste steps
			return;
		}

		if(pulsarInfos.workflow && !scope.me.hasWorkflow(pulsarInfos.workflow)){
			elem.data('skip-pulsar', 'true');// ne remonte pas dans liste steps
			//vire les pulsars qui ont pas les droits (pb si dernier & premier !!)
			return;
		}
		*/

		scope.pulsarInfos = pulsarInfos;
		scope.pulsarInfos.steps = [];

		let pulsars = $('[pulsar]');
		pulsars.each( (index, element) => {
			let infos = angular.element(element).scope().$eval( $(element).attr('pulsar') as any );
			infos.el = element;
			scope.pulsarInfos.steps.push(infos);
		});

		if(typeof pulsarInfos !== 'object' || pulsarInfos.index === undefined){
			console.error('Invalid pulsar object. Should look like pulsar="{ index: 0, i18n: \'my.key\', position: \'top bottom\'}"')
		}

		let pulsarButton:JQLite|null=null;
		let pulsarElement:JQLite|null=null;
		// content box

		let pulsarSize = 40;
		let pulsarMarge = 5;
		let pulsarLayerMarge = 10;

		let paintPulsar = () => {
			if(!pulsarInfos.position){
				pulsarInfos.position = 'center center';
			}
			let xPosition:XPosition = 'center';
			if(pulsarInfos.position.indexOf('left') !== -1){
				xPosition = 'left';
			}
			if(pulsarInfos.position.indexOf('right') !== -1){
				xPosition = 'right';
			}

			let yPosition:YPosition = 'center';
			if(pulsarInfos.position.indexOf('top') !== -1){
				yPosition = 'top';
			}
			if(pulsarInfos.position.indexOf('bottom') !== -1){
				yPosition = 'bottom';
			}

			// FIXME: embedded CSS
			if( ! document.querySelector("style#pulsar-css") ) {
				$( require('./pulsar.directive.html').default ).appendTo('body');
			}

			pulsarButton = $(`
				<div class="pulsar-button">
					<div class="pulse"></div>
					<div class="pulse2"></div>
					<div class="pulse-spot"></div>
				</div>
			`)
			.appendTo('body');

			if(pulsarInfos.className){
				pulsarInfos.className.split(' ').forEach(function(cls){
					pulsarButton?.addClass(cls);
				});
			}

			pulsarButton.data('active', true);

			let firstCycle = true;
			let placePulsar = () => {
				let deltaX = 0;
				let deltaY = 0;

				if(typeof pulsarInfos.delta === "string"){
					pulsarInfos.delta = idiom.translate(pulsarInfos.delta)
					deltaX = parseInt(pulsarInfos.delta.split(' ')[0]);
					deltaY = parseInt(pulsarInfos.delta.split(' ')[1]);
				}

				const elemOffset = elem.offset() ?? {left:0, top:0};
				const elemWidth = elem.width() ?? 0;
				const elemHeight = elem.height() ?? 0;
				//console.log( "elemOffset="+ elemOffset.toString() +", elemWidth ="+elemWidth.toString() +", elemHeight="+elemHeight.toString() );
				let xPositions = {
					left: elemOffset.left - (pulsarSize + pulsarMarge),
					right: elemOffset.left + elemWidth + pulsarMarge,
					center: elemOffset.left + (elemWidth / 2) - pulsarSize / 2
				};

				let yPositions = {
					top: elemOffset.top,
					bottom: elemOffset.top + elemHeight + pulsarMarge,
					center: elemOffset.top + (elemHeight / 2) - pulsarSize / 2
				};

				if(pulsarInfos.position === 'top center'){
					yPositions.top = elemOffset.top - pulsarSize - pulsarMarge;
				}


				if(pulsarButton?.css('display') !== 'none'){
					pulsarButton?.offset({ left: xPositions[xPosition]+deltaX, top: yPositions[yPosition]+deltaY });
					// Adjust style as required (z-index)
					if( pulsarInfos.style && typeof pulsarInfos.style.zIndex==="number" ) {
						pulsarButton?.css('z-index', pulsarInfos.style.zIndex);
					}
				}

				if(pulsarElement && pulsarElement.find('.arrow').length){

					let left = xPositions[xPosition] - (pulsarElement.children('.content').width()??0) - pulsarSize / 2
					let top = yPositions[yPosition] - pulsarLayerMarge ;

					if(yPosition === 'top' && xPosition === 'center'){
						top = yPositions[yPosition] - (pulsarElement.children('.content').height()??0) - pulsarSize / 2;
					}
					if(yPosition === 'center'){
						top = yPositions[yPosition] - ((pulsarElement.children('.content').height()??0) / 2);

						//top = yPositions[yPosition] - (pulsarElement.children('.content').width() / 2) + pulsarLayerMarge + pulsarMarge * 2;
					}
					if(xPosition === 'center'){
						left = (xPositions[xPosition] - ((pulsarElement.children('.content').width()??0) / 2)) -2;
					}
					if(yPosition === 'center' && xPosition === 'center'){
						pulsarElement.addClass('middle');
						yPosition = 'bottom';
					}
					if(xPosition === 'right'){
						left = xPositions[xPosition] + pulsarLayerMarge + pulsarMarge * 2;
					}
					if(yPosition === 'bottom'){
						if(xPosition === 'center'){
							top = yPositions[yPosition] + pulsarLayerMarge + pulsarMarge * 2;
						}else{
							top = yPositions[yPosition] - (pulsarLayerMarge + pulsarMarge);
						}
					}


				// If pulsarElement position is cropped by browser:
					const windowWidth = ($(window).width() ?? 0);
					const windowHeight = ($(window).height() ?? 0);

					var pulsarElementMarge = 15;

					var oldTop = top;
					var oldLeft = left

					var maxX = oldLeft + (pulsarElement.width() ?? 0) + pulsarElementMarge;
					var maxY = oldTop + (pulsarElement.height() ?? 0) + pulsarElementMarge

					var newLeft = windowWidth - ((pulsarElement.width() ?? 0) + pulsarElementMarge);
					var newBottom = windowHeight - ((pulsarElement.height() ?? 0) + pulsarElementMarge);

					var gapLeft = oldLeft - newLeft;
					var gapRight = pulsarElementMarge - (oldLeft);
					var gapBottom = oldTop - newBottom;
					var gapTop = pulsarElementMarge - (oldTop);

					var arrow = pulsarElement.find('.arrow');
					var arrowXpos = arrow.position().left;
					var arrowYpos = arrow.position().top;

					//console.log('init posY ' + arrowYpos);

					//// X CORRECT

					//right
					if(maxX > windowWidth) {

						left = windowWidth - ((pulsarElement.width() ?? 0) + pulsarElementMarge);
						if(xPosition === 'center'){
							if(firstCycle){
								arrow.css({left : arrowXpos + gapLeft, right : 'auto'});
								firstCycle = false;
							}
						}
					}
					//left
					if(left <= pulsarElementMarge){

						left = pulsarElementMarge;
						if(xPosition === 'center'){
							if(firstCycle){
								arrow.css({left : gapRight + pulsarLayerMarge, right : 'auto'});
								firstCycle = false;
							}
						}
					}

					//// Y CORRECT

					//bottom
					if(maxY > windowHeight){
						top = newBottom;
						if(yPosition === 'bottom'){
							if(firstCycle){
								arrow.css({top : gapBottom + pulsarMarge, bottom : 'auto'});
								firstCycle = false;
								}
						}
					}
					//top --ok
					if(top < pulsarElementMarge){
						top = pulsarElementMarge;

						if(yPosition === 'center' && xPosition !== 'center'){
							if(firstCycle){
								arrow.css({top : (arrowYpos - gapTop), bottom : 'auto'});
								firstCycle = false;

								}
						}
					}

					// apply content box position
					pulsarElement.offset({
						left: left + deltaX,
						top: top + deltaY
					});
			}
				setTimeout(placePulsar, 100);
			}
			placePulsar();


			var placeLayers = () => {
				let pulsarHighlight;
				$('.pulsar-layer').remove();

				var check = '[pulsar-highlight=' + pulsarInfos.index +']';
				var highlight = $( "body" ).find(check);
				if(highlight.length !== 0){
					pulsarHighlight = highlight;
				}

				if(!pulsarHighlight){
					pulsarHighlight = elem;
				}

				 $('<div class="pulsar-layer"></div>')

					.width((pulsarHighlight.outerWidth() ?? 0) + pulsarLayerMarge * 2)
					.height((pulsarHighlight.outerHeight() ?? 0) + pulsarLayerMarge *  2)
					.offset({ top: (pulsarHighlight?.offset()?.top ?? 0) - pulsarLayerMarge, left: (pulsarHighlight?.offset()?.left ?? 0) - pulsarLayerMarge, })
					.css({position: "absolute"})
					.hide()
					.appendTo('body')
					.fadeIn("slow");
			};

			pulsarButton.on('click', () => {
				$('body').css('pointer-events', 'none');
				$('body').on('scroll touchmove mousewheel', function(e){
				  e.preventDefault();
				  e.stopPropagation();
				  return false;
				})

				scope.pulsarInfos.steps = [];
				pulsars = $('[pulsar]');
				//recup tt les pulsar

				pulsars.each(function(index, element){
					//on recup les infos de chaque pulsar
					let infos = angular.element(element).scope().$eval( $(element).attr('pulsar') as any );
					infos.el = element;
					scope.pulsarInfos.steps.push(infos);
				});

				// create content box
				pulsarElement = $('<pulsar></pulsar>')
					.addClass(xPosition)
					.addClass(yPosition);
				if(pulsarInfos.className){
					pulsarInfos.className.split(' ').forEach( cls => {
						pulsarElement?.addClass(cls);
					});
				}
				pulsarButton?.hide();
				placeLayers();
				$(window).on('resize.placeLayers', placeLayers);
				//scroll voir hauteur document ou bloquer scroll
				// ok pour xp on layers

				http.get<string>('/infra/public/template/pulsar.html').then( html => {
					let tmp = $(html);
					tmp.find('button').addClass('btn btn-primary');
					let scoped = this.$compile(tmp)(scope);
					pulsarElement?.html( scoped as any );
				});
				$('body').append(pulsarElement);
			});
		}

		angular.element(window).on('resize', () => {
			if(!pulsarButton){
				return;
			}
			if($(window).width()??0 <= this.helperSvc.TABLET){
				pulsarButton.css('display', 'none');
			}
			else if(pulsarButton.data('active')){
				pulsarButton.css('display', '');
			}
		});

		let firstCycle = false;

		const undraw = () => {
			// chaque nextStep + end
			pulsarElement?.find('button').css('pointer-events', 'none');
			$(window).off('resize.placeLayers');
			pulsarButton?.fadeOut('slow', function(){ pulsarButton?.remove() });
			pulsarElement?.fadeOut('slow', function(){ pulsarElement?.remove() });
			$('.pulsar-layer').remove();
			$('body').off('scroll touchmove mousewheel');
			$('body').css('pointer-events', '');
			firstCycle = true;
			pulsarButton?.data('active', false);
		}

		scope.closePulsar = () => {
			if(!pulsarElement || !pulsarButton){
				return
			}
			pulsarElement.fadeOut(0 , function(){ pulsarElement?.remove() });
			pulsarButton.removeClass('hidden');
			$('.pulsar-layer').fadeOut(0 , function(){ $('.pulsar-layer').remove() });
			$('body').off('scroll touchmove mousewheel');
			$('body').css('pointer-events', '');
			firstCycle = true;
			pulsarButton.data('active', false);

		};
		angular.element(document).on('click', (e) => {
			if(
				$(e.target).parents('pulsar').length > 0 ||
				$(e.target).parents('.pulsar-button').length > 0 ||
				$(e.target).hasClass('pulsar-button')
			){
				return;
			}
			scope.closePulsar();
		});

		scope.paintPulsar = () => {
			paintPulsar();
			pulsarButton?.triggerHandler('click');
		};

		scope.isLastStep = function(){
			return scope.pulsarInfos.steps.find( step => {
				return step.index > scope.pulsarInfos.index;
			}) === undefined;
		};

		scope.goTo = (step:PulsarInfos) => {
			undraw();
			this.quickstartSvc.goToAppStep(step.index);
			if(step.el) {
				(angular.element(step.el).scope() as Scope).paintPulsar();
			}

		};

		scope.next = () => {
			undraw();
			let index = this.quickstartSvc.nextAppStep();
			let item = scope.pulsarInfos.steps.find(item => item.index===index);
			if( item === undefined){
				if( scope.pulsarInfos.steps.find(item => item.index>index) !== undefined ) {
					scope.next();
				}
			} else {
				if(item.el){
					if(angular.element(item.el).data('skip-pulsar')){
						scope.next();
						return;
					}
					(angular.element(item.el).scope() as Scope).paintPulsar();
				}
			}
		};

		scope.previous = () => {
			undraw();
			let index = this.quickstartSvc.previousAppStep();
			if(scope.pulsarInfos.steps.find(item => item.index===index) === undefined){
				if(scope.pulsarInfos.steps.find(item => item.index<index) !== undefined){
					scope.previous();
				}
				return;
			}
			for(let i = 0; i < scope.pulsarInfos.steps.length; i++){
				let item = scope.pulsarInfos.steps[i];
				if(item.index === index && item.el){
					if(angular.element(item.el).data('skip-pulsar')){
						scope.previous();
						return;
					}
					(angular.element(item.el).scope() as Scope).paintPulsar();
				}
			}
		};

		this.quickstartSvc.load( () => {
			if(this.quickstartSvc.appIndex() === pulsarInfos.index){
				paintPulsar();
			}
		});
	}

    constructor( 
		private $compile:ICompileService,
        private helperSvc:NgHelperService,
        private quickstartSvc:QuickstartService
    ) {}
}

/** The pulsar directive.
 *
 * Usage:
 *      &lt;a pulsar="{ index: 3, i18n: 'portal.pulsar.apps', position: 'bottom center'}"></a&gt;
 */
export function DirectiveFactory(
	$compile:ICompileService,
	odeNgHelperService:NgHelperService, 
	odeQuickstartService:QuickstartService
	) {
	return new Directive($compile, odeNgHelperService, odeQuickstartService);
}
DirectiveFactory.$inject=["$compile", "odeNgHelperService", "odeQuickstartService" ];