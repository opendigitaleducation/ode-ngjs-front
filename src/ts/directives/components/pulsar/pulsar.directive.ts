import angular, { IAttributes, ICompileService, IController, IDirective, IScope } from "angular";
import { BootstrappedNotice, ConfigurationFrameworkFactory, EVENT_NAME, IIdiom, NotifyFrameworkFactory, SessionFrameworkFactory, TransportFrameworkFactory, ITheme } from "ode-ts-client";
import { NgHelperService } from "../../../services";
import { SessionService } from "../../../services/session.service";
import { UserService } from "../../../services/user.service";

/* Local types */
type PulsarInfos = {
	index:number, 
	i18n:string, 
	position:string, 
	className:string,
	workflow?:string,
	el?:HTMLElement,
	steps:PulsarInfos[],
	delta?:string
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
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
	restrict= 'A';
	scope= true;

    link(scope:Scope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		const idiom = ConfigurationFrameworkFactory.instance().Platform.idiom;
		const http = TransportFrameworkFactory.instance().http;
		const windowWidth = () => { return this.helperSvc.width(angular.element(window)); };
		const windowHeight = () => { return this.helperSvc.height(angular.element(window)); };

		// Legacy code (angular templates in old format)
		scope.me = {
			hasWorkflow: SessionFrameworkFactory.instance().session.hasWorkflow
		};

		if( this.helperSvc.viewport <= this.helperSvc.TABLET ||  /* TODO contrôle à appliquer à l'aide d'une directive ?*/
			!scope.me.hasWorkflow('org.entcore.portal.controllers.PortalController|quickstart')){
			return;
		}

		const pulsarInfos:PulsarInfos = scope.$eval(attrs.pulsar);

		if( !pulsarInfos.workflow || !scope.me.hasWorkflow(pulsarInfos.workflow) ) {
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

		let pulsars = this.helperSvc.querySelect('[pulsar]');
		this.helperSvc.each(pulsars, (index, element) => {
			const e = angular.element(element);
			let infos = e.scope().$eval( e.attr('pulsar'));
			infos.el = element;
			scope.pulsarInfos.steps.push( infos );
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

			const pulsarButton = this.$compile('<div class="pulsar-button"><div class="pulse"></div><div class="pulse2"></div><div class="pulse-spot"></div></div>')(scope);
			this.helperSvc.querySelect('body').append( pulsarButton );

			if(pulsarInfos.className){
				pulsarInfos.className.split(' ').forEach(function(cls){
					pulsarButton.addClass(cls);
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

				let xPositions:{[p in XPosition]:number} = {
					left: this.helperSvc.offset(elem).left - (pulsarSize + pulsarMarge),
					right: this.helperSvc.offset(elem).left + this.helperSvc.width(elem) + pulsarMarge,
					center: this.helperSvc.offset(elem).left + (this.helperSvc.width(elem) / 2) - pulsarSize / 2
				};

				let yPositions:{[p in YPosition]:number} = {
					top: this.helperSvc.offset(elem).top,
					bottom: this.helperSvc.offset(elem).top + this.helperSvc.height(elem) + pulsarMarge,
					center: this.helperSvc.offset(elem).top + (this.helperSvc.height(elem) / 2) - pulsarSize / 2
				};

				if(pulsarInfos.position === 'top center'){
					yPositions.top = this.helperSvc.offset(elem).top - pulsarSize - pulsarMarge;
				}

				if(pulsarButton.css('display') !== 'none'){
					this.helperSvc.offset(
						pulsarButton,
						{left: xPositions[xPosition]+deltaX, top: yPositions[yPosition]+deltaY}
					);
				}

				if(pulsarElement && pulsarElement.find('.arrow').length){

					let left = xPositions[xPosition] - this.helperSvc.width(pulsarElement.find('.content')) - pulsarSize / 2;
					let top = yPositions[yPosition] - pulsarLayerMarge ;

				// place pulsarElement // element

					if(yPosition === 'top' && xPosition === 'center'){
						top = yPositions[yPosition] - this.helperSvc.height(pulsarElement.find('.content')) - pulsarSize / 2;
					}
					if(yPosition === 'center'){
						top = yPositions[yPosition] - (this.helperSvc.height(pulsarElement.find('.content')) / 2);

						//top = yPositions[yPosition] - (pulsarElement.children('.content').width() / 2) + pulsarLayerMarge + pulsarMarge * 2;
					}
					if(xPosition === 'center'){
						left = (xPositions[xPosition] - (this.helperSvc.width(pulsarElement.find('.content')) / 2)) -2;
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

					var pulsarElementMarge = 15;

					var oldTop = top;
					var oldLeft = left

					var maxX = oldLeft + (this.helperSvc.width(pulsarElement) + pulsarElementMarge);
					var maxY = oldTop + (this.helperSvc.height(pulsarElement) + pulsarElementMarge);

					var newLeft = windowWidth() - (this.helperSvc.width(pulsarElement) + pulsarElementMarge);
					var newBottom = windowHeight() - (this.helperSvc.height(pulsarElement) + pulsarElementMarge);

					var gapLeft = oldLeft - newLeft;
					var gapRight = pulsarElementMarge - (oldLeft);
					var gapBottom = oldTop - newBottom;
					var gapTop = pulsarElementMarge - (oldTop);

					var arrow = pulsarElement.find('.arrow');
					var arrowXpos = arrow.css("left"); // FIXME was arrow.position().left;
					var arrowYpos = arrow.css("top");  // FIXME was arrow.position().top

					//console.log('init posY ' + arrowYpos);

					//// X CORRECT

					//right
					if(maxX > windowWidth()) {

						left = windowWidth() - (this.helperSvc.width(pulsarElement) + pulsarElementMarge);
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
					if(maxY > windowHeight()){
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
								arrow.css({top : (parseInt(arrowYpos) - gapTop), bottom : 'auto'});
								firstCycle = false;

								}
						}
					}

					// apply content box position
					this.helperSvc.offset(pulsarElement, {
						left: left + deltaX,
						top: top + deltaY
					});
				}
				setTimeout(placePulsar, 100);
			}
			placePulsar();


			var placeLayers = () => {
				let pulsarHighlight;

				angular.element('.pulsar-layer').remove();

				var check = '[pulsar-highlight=' + pulsarInfos.index +']';
				var highlight = angular.element( "body" ).find(check);
				if(highlight.length !== 0){
					pulsarHighlight = highlight;
				}

				if(!pulsarHighlight){
					pulsarHighlight = elem;
				}

				const locEl = angular.element('<div class="pulsar-layer"></div>');
				//FIXME with jquery... ?
				// locEl
				// 	.width(pulsarHighlight.outerWidth() + pulsarLayerMarge * 2)
				// 	.height(pulsarHighlight.outerHeight() + pulsarLayerMarge *  2)
				// 	.offset({ top: pulsarHighlight.offset().top - pulsarLayerMarge, left: pulsarHighlight.offset().left - pulsarLayerMarge, })
				// 	.css({position: "absolute"})
				// 	.hide()
				// 	.appendTo('body')
				// 	.fadeIn("slow");
			};

			pulsarButton.on('click', () => {
				angular.element('body').css('pointer-events', 'none');
				angular.element('body').on('scroll touchmove mousewheel', function(e){
					e.preventDefault();
					e.stopPropagation();
					return false;
				})

				scope.pulsarInfos.steps = [];
				pulsars = angular.element('[pulsar]');
				//recup tt les pulsar

				this.helperSvc.each(pulsars, (index, element) => {
					//on recup les infos de chaque pulsar
					let infos = angular.element(element).scope().$eval(angular.element(element).attr('pulsar'));
					infos.el = element;
					scope.pulsarInfos.steps.push(infos);
				});

				// create content box
				const pulsarElement = angular.element('<pulsar></pulsar>')
					.addClass(xPosition)
					.addClass(yPosition);
				if(pulsarInfos.className){
					pulsarInfos.className.split(' ').forEach(function(cls){
						pulsarElement.addClass(cls);
					});
				}
				pulsarButton.css( 'display', 'none' );	// FIXME was .hide()
				placeLayers();
				angular.element(window).on('resize.placeLayers', placeLayers);
				//scroll voir hauteur document ou bloquer scroll
				// ok pour xp on layers

				http.get<string>('/infra/public/template/pulsar.html').then( html => {
					pulsarElement.html( this.$compile(html)(scope).text() );
				});
				angular.element('body').append(pulsarElement);
			});
		}

		angular.element(window).on('resize', () => {
			if(!pulsarButton){
				return;
			}
			if(windowWidth() <= this.helperSvc.TABLET){
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
			angular.element(window).off('resize.placeLayers');
			//FIXME jquery ?
			// pulsarButton.fadeOut('slow', function(){ pulsarButton.remove() });
			// pulsarElement.fadeOut('slow', function(){ pulsarElement.remove() });
			angular.element('.pulsar-layer').remove();
			angular.element('body').off('scroll touchmove mousewheel');
			angular.element('body').css('pointer-events', '');
			firstCycle = true;
			pulsarButton?.prop('data-active', false);
		}

		scope.closePulsar = () => {
			if(!pulsarElement || !pulsarButton){
				return;
			}
			//FIXME jquery ?
			// pulsarElement.fadeOut(0 , function(){ pulsarElement.remove() });
			pulsarButton.removeClass('hidden');
			// angular.element('.pulsar-layer').fadeOut(0 , function(){ angular.element('.pulsar-layer').remove() });
			angular.element('body').off('scroll touchmove mousewheel');
			angular.element('body').css('pointer-events', '');
			firstCycle = true;
			pulsarButton?.prop('data-active', false);

		};
		angular.element(document).on('click', (e) => {
			if(
				this.helperSvc.parents( angular.element(e.target), 'pulsar').length > 0 ||
				this.helperSvc.parents( angular.element(e.target), '.pulsar-button').length > 0 ||
				angular.element(e.target).hasClass('pulsar-button')
			){
				return;
			}
			scope.closePulsar();
		});

		scope.paintPulsar = function(){
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
			quickstart.goToAppStep(step.index);
			if(step.el) {
				angular.element(step.el).scope().paintPulsar(); // FIXME voir doc de scope()
			}

		};

		scope.next = function(){

			undraw();
			let index = quickstart.nextAppStep();
			if(_.findWhere(scope.pulsarInfos.steps, { index: index}) === undefined){
				if(_.find(scope.pulsarInfos.steps, function(item){ return item.index > index}) !== undefined){
					scope.next();
				}
				return;
			}
			for(let i = 0; i < scope.pulsarInfos.steps.length; i++){
				let item = scope.pulsarInfos.steps[i];
				if(item.index === index){
					if(angular.element(item.el).data('skip-pulsar')){
						scope.next();
						return;
					}
					angular.element(item.el).scope().paintPulsar();
				}
			}
		};

		scope.previous = function(){
			undraw();
			let index = quickstart.previousAppStep();
			if(_.findWhere(scope.pulsarInfos.steps, { index: index}) === undefined){
				if(_.find(scope.pulsarInfos.steps, function(item){ return item.index < index}) !== undefined){
					scope.previous();
				}
				return;
			}
			for(let i = 0; i < scope.pulsarInfos.steps.length; i++){
				let item = scope.pulsarInfos.steps[i];
				if(item.index === index){
					if(angular.element(item.el).data('skip-pulsar')){
						scope.previous();
						return;
					}
					angular.element(item.el).scope().paintPulsar();
				}
			}
		};

		quickstart.load(function(){
			if(quickstart.appIndex() !== pulsarInfos.index){
				return;
			}

			paintPulsar();
		});
	}

    constructor( 
        private helperSvc:NgHelperService,
        private quickstartSvc:QuickstartService,
		private $compile:ICompileService
    ) {}
}

/** The pulsar directive.
 *
 * Usage:
 *      &lt;a pulsar="{ index: 3, i18n: 'portal.pulsar.apps', position: 'bottom center'}"></a&gt;
 */
export function DirectiveFactory(odeNgHelperService:NgHelperService, $compile:ICompileService) {
	return new Directive(odeNgHelperService, $compile);
}
DirectiveFactory.$inject=["odeNgHelperService","$compile"];