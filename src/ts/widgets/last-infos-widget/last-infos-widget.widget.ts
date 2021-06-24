import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import moment from "moment";
import { ConfigurationFrameworkFactory, ILastInfosModel, LastInfosWidget } from "ode-ts-client";

interface IExtendedLastInfosModel extends ILastInfosModel {
	relativeDate: string;
	tooltip: string;
}

/* Controller for the directive */
class Controller implements IController {
	public widget = new LastInfosWidget();
	private lang = ConfigurationFrameworkFactory.instance().Platform.idiom;

	public infos:IExtendedLastInfosModel[] = [];
	public resultSizeValues = [1,2,3,4,5,6,7,8,9,10];
	public resultSize = 4;
	public display = {
		edition: false
	};

	load():Promise<void> {
		return this.widget.loadInfos( this.resultSize ).then( infos => {
			this.infos = infos.map( info => {
				(info as IExtendedLastInfosModel).relativeDate = moment(info.date).fromNow();
				(info as IExtendedLastInfosModel).tooltip = this.lang.translate('actualites.widget.thread') + ' : ' + info.thread_title +
					' | ' + this.lang.translate('actualites.widget.author') + ' : ' + info.username;
				return info as IExtendedLastInfosModel;
			});
		});
	};
	
	openConfig(){
		this.display.edition = true;
	};
	
	closeConfig(){
		this.display.edition = false;
	};
	
	saveConfig(){
		return this.widget.setMaxResults( this.resultSize );
	};
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./last-infos-widget.widget.html').default;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		ctrl.widget.getMaxResults().then( num => {
			ctrl.resultSize = num;
			ctrl.load().then( () => {
				scope.$apply();
			});
		});
	}
}

/** The last-infos widget.
 *
 * Usage:
 *      &lt;ode-last-infos></ode-last-infos&gt;
 */
function DirectiveFactory() {
	return new Directive();
}

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeLastInfosWidgetModule";
angular.module( odeModuleName, []).directive( "odeLastInfosWidget", DirectiveFactory );

/*
var actualitesWidget = model.widgets.findWidget("last-infos-widget");
actualitesWidget.resultSizeValues = [1,2,3,4,5,6,7,8,9,10];
actualitesWidget.display = {
	edition: false
};

actualitesWidget.updateInfos  = function(){
	http().get('/actualites/infos/last/' + actualitesWidget.resultSize).done(function(infos){
		var enrichedInfos = _.chain(infos).map(function(info){
			info.relativeDate = moment(info.date).fromNow();
			info.tooltip = lang.translate('actualites.widget.thread') + ' : ' + info.thread_title +
				' | ' + lang.translate('actualites.widget.author') + ' : ' + info.username;
			return info;
		}).value();

		actualitesWidget.infos = enrichedInfos;
		model.widgets.apply();
	});
};

if(actualitesWidget.resultSize === undefined){
	http().get('/userbook/preference/maxInfos').done(function(maxInfos){
		if(!maxInfos.preference){
			actualitesWidget.resultSize = 5; // Default size value
		} else {
			actualitesWidget.resultSize = parseInt(maxInfos.preference);
		}
		model.widgets.apply();
		actualitesWidget.updateInfos();
	});
}
else {
	actualitesWidget.updateInfos();
}

actualitesWidget.openConfig = function(){
	actualitesWidget.display.edition = true;
};

actualitesWidget.closeConfig = function(){
	actualitesWidget.display.edition = false;
};

actualitesWidget.saveConfig = function(){
	http().putJson('/userbook/preference/maxInfos', actualitesWidget.resultSize);
	actualitesWidget.closeConfig();
	actualitesWidget.updateInfos();
};
*/