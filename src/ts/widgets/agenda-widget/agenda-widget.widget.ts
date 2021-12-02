import angular, { IAttributes, IController, IDirective } from "angular";
import { conf, L10n, notif, http, TrackedActionFromWidget } from "../../utils"; 
import { TrackedAction, TrackedScope } from "../../utils/TrackedScope";

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
		var numberHoursLag = L10n.moment( L10n.moment(date).format("YYYY MM DD HH:MM") )
			.format('Z')
			.split(':')[0];
		return L10n.utc(date).add(numberHoursLag, 'hours');
	}

	toDisplayedGroup(date:string) {
		return this.dateToMoment(date).format('dddd D MMMM YYYY');	// FIXME localize the format string with i18n ! See formats at https://momentjs.com/docs/#/displaying/format/
	}

	toDisplayedDate(date:string) {
		return this.dateToMoment(date).format('HH:mm');
	}
	
	today(format:string){
		return L10n.moment().format(format);
	}

	loadEvents() {
		return http().get<IAgenda[]>('/calendar/calendars')
		.then( calendars => {
			if( angular.isArray(calendars) && calendars.length > 0 ) {
				let filter = calendars.map( calendar => 'calendarId='+calendar._id ).join('&');
				console.log('filter calendarWidget : ' + filter);
				return filter;
			}
			return null;
		})
		.then( filterOn => {
			return filterOn===null? [] : http().get<IAgendaEvent[]>('/calendar/events/widget?' + filterOn + '&nb=' + this.MAX_EVENTS_DISPLAYED);
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
class Directive implements IDirective<TrackedScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./agenda-widget.widget.html').default;
	scope = {};
	bindToController = true;
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeAgendaWidget'];

    link(scope:TrackedScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl ) {
            return;
		}
		ctrl.loadEvents().then( events => {
			ctrl.setEvents( events );
			scope.$apply();
		});

		// Give an opportunity to track some events from outside of this widget.
		scope.trackEvent = (e:Event, p:CustomEventInit<TrackedAction>) => {
			// Allow events to bubble up.
			if(typeof p.bubbles === "undefined") p.bubbles = true;

			let event = null;
			if( p && p.detail?.open==='app' ) {
				event = new CustomEvent( TrackedActionFromWidget.agenda, p );
			} else if( p && p.detail?.open==='event' ) {
				event = new CustomEvent( TrackedActionFromWidget.agenda, p );
			}
			if( event && e.currentTarget ) {
				e.currentTarget.dispatchEvent(event);
			}
		}
	}
}

/** The agenda widget. */
function DirectiveFactory() {
	return new Directive();
}

// Preload translations
notif().onLangReady().promise.then( lang => {
	switch( lang ) {
		default:	conf().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
	}
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeAgendaWidgetModule";
angular.module( odeModuleName, []).directive( "odeAgendaWidget", DirectiveFactory );
