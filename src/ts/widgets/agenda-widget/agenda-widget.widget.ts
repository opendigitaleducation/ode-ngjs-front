import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ConfigurationFrameworkFactory, NotifyFrameworkFactory, TransportFrameworkFactory } from "ode-ts-client";
import moment from 'moment'; // FIXME : should we use moment anymore ?

type ResourceMetadata = {
	_id: string;
	created: { $date: number; };
	modified: { $date: number; };
	owner: {
		userId: string;
		displayName: string;
	};
};
type SharedWith = {groupId?:string} & {[sharedKey:string]:boolean};

interface IAgenda extends ResourceMetadata {
	title: string;
	color: string;
	shared:SharedWith[];
}

interface IAgendaEvent extends ResourceMetadata {
	title: string;
	description: string;
	location: string;
	calendar: string[];
	allday: boolean;
	recurrence: boolean;
	isRecurrent: boolean;
	index: number;
	startMoment: string;	//"2021-06-24T11:00:00.000Z",
	endMoment: string;		//"2021-06-24T11:00:00.000Z",
	notifStartMoment: string;		//"24/06/2021 13:00",
	notifEndMoment: string;		//"24/06/2021 14:00",
	icsUid: string;
}

interface IDisplayedEventData {
	displayedGroup: string;
	displayedDate: string;
}

type DisplayedEvent = IAgendaEvent & IDisplayedEventData;

/* Controller for the directive */
class Controller implements IController {
	public userEvents:DisplayedEvent[] = [];
	public dayGroups:string[] = [];
	/** Maximum number of events displayed by the widget. */
	readonly MAX_EVENTS_DISPLAYED = 5;

	private dateToMoment(date:string) {
		var numberHoursLag = moment(moment(date)
			.format("YYYY MM DD HH:MM"), "YYYY MM DD HH:MM")
			.format('Z')
			.split(':')[0];
		return moment.utc(date).add(numberHoursLag, 'hours');
	}

	toDisplayedGroup(date:string) {
		return this.dateToMoment(date).format('dddd D MMMM YYYY');	// FIXME localize the format string with i18n ! See formats at https://momentjs.com/docs/#/displaying/format/
	}

	toDisplayedDate(date:string) {
		return this.dateToMoment(date).format('HH:mm');
	}
	
	today(format:string){
		return moment().format(format);
	}

	loadEvents() {
		return TransportFrameworkFactory.instance().http.get<IAgenda[]>('/calendar/calendars')
		.then( calendars => {
			if( angular.isArray(calendars) && calendars.length > 0 ) {
				let filter = calendars.map( calendar => 'calendarId='+calendar._id ).join('&');
				console.log('filter calendarWidget : ' + filter);
				return filter;
			}
			return null;
		})
		.then( filterOn => {
			return filterOn===null? [] : TransportFrameworkFactory.instance().http.get<IAgendaEvent[]>('/calendar/events/widget?' + filterOn + '&nb=' + this.MAX_EVENTS_DISPLAYED);
		});
	}

	setEvents( events:IAgendaEvent[] ) {
		if( angular.isArray(events) ) {
			this.dayGroups = [];
			this.userEvents = [];
			let lastGroup = '';
			events.forEach( ev => {
				const displayed = Object.assign({
					displayedGroup: this.toDisplayedGroup(ev.startMoment), 
					displayedDate:  this.toDisplayedDate(ev.startMoment)
				}, ev);
				this.userEvents.push( displayed );
				if( lastGroup !== displayed.displayedGroup ) {
					lastGroup = displayed.displayedGroup;
					this.dayGroups.push( lastGroup );
				}
			});
		}
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./agenda-widget.widget.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeAgendaWidget'];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) {
            return;
		}
		ctrl.loadEvents().then( events => {
			ctrl.setEvents( events );
			scope.$apply();
		});
	}
}

/** The agenda widget. */
function DirectiveFactory() {
	return new Directive();
}

// Preload translations
NotifyFrameworkFactory.instance().onLangReady().promise.then( lang => {
	switch( lang ) {
		default:	ConfigurationFrameworkFactory.instance().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
	}
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeAgendaWidgetModule";
angular.module( odeModuleName, []).directive( "odeAgendaWidget", DirectiveFactory );
