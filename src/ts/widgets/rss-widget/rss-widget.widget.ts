import angular, { IAttributes, IController, IDirective, IScope, IWindowService } from "angular";
import { ConfigurationFrameworkFactory, NotifyFrameworkFactory, TransportFrameworkFactory } from "ode-ts-client";
import { L10n } from "../../utils";

type Feed = {title:string, link:string, show?:number};
type Channel = {
	_id?:string;
	feeds: Array<Feed>;
	owner?: {
	  userId: string;
	  displayName: string;
	};
	created?: {
	  "$date": number
	};
	modified?: {
	  "$date": number
	};
}
type RssContent = {
	title: string;
	link: string;
	description: string;
	pubDate: string;
}
type FeedContent = RssContent & {
	language: string;
	Items: Array<RssContent>;
	status: number;
}

/* Controller for the directive */
class Controller implements IController {
	channel:Channel = undefined as unknown as Channel;
	feeds:Feed[] = [];
	selectedFeed?:Feed;
	selectedFeedIndex?:number;
	totalFeeds = 10; // limit of feeds
	defaultShow = 3; // limit of article by feeds
	showValues = [1,2,3,4,5,6,7,8,9,10];
	display:{
		edition:boolean;
		feedEdition:boolean;
		selectedFeed?:number;
	} = {
		edition: false,
		feedEdition: false,
		selectedFeed: -1
	};

	initFeeds():Promise<void> {
		if(this.channel === undefined){
			return TransportFrameworkFactory.instance().http.get<Channel[]>('/rss/channels')
			.then( channels => {
				if(channels && channels.length > 0) {
					this.channel = channels[0];
				} else {
					this.channel = {feeds:[]};
				}
				return this.loadFeeds(0); // 0 : default, from the cache
			})
			.catch( e => {
				console.warn("[widget.rss] failed to initFeeds: ", e)
				this.channel = {feeds:[]};
			});
		} else {
			return this.loadFeeds(0); // 0 : default, from the cache
		}
	}

	private loadFeeds( force:number ):Promise<void> {
		this.feeds = [];
		return Promise.all( this.channel.feeds.map( feed => {
			const mytitle = feed.title;
			if(feed.link !== null && feed.link !== ""){
				return TransportFrameworkFactory.instance().http.get<FeedContent>('/rss/feed/items?url=' + encodeURIComponent(feed.link) + '&force=' + force)
				.then( result => {
					if(!result.title) result.title = mytitle;
					if(result.status===200 && this.feeds.length < this.totalFeeds){
						if(result.Items !== undefined && feed.show != undefined && result.Items.length > feed.show){
							result.Items = result.Items.slice(0, feed.show);
						}
						this.feeds.push(result);
					}
				})
				.catch( e => {
					console.warn("[widget.rss] failed to loadFeeds: ", e);
				});
			} else {
				return Promise.resolve();
			}
		}))
		.then( results => {} );
	};

	public get canAddFeed():boolean {
		const ww = $(window).width();
		return (this.channel && this.channel.feeds.length < this.totalFeeds) && (typeof ww!=="number" || ww >= 992);
	}
	
	openFeedEdition(index:number) {
		if(typeof index==="number" && index >= 0 && index < this.totalFeeds){
			this.selectedFeed = angular.copy(this.channel.feeds[index]);
			this.selectedFeedIndex = index;
		}else{
			this.selectedFeed = {title:"", link:"", show:3};
			this.selectedFeedIndex = -1;
		}
		this.display.feedEdition = true;
	}
	
	closeFeedEdition() {
		this.display.feedEdition = false;
		this.selectedFeed = undefined;
		this.selectedFeedIndex = undefined;
	}
	
	removeFeed(index:number){
		if(index && index >= 0 && index < this.totalFeeds){
			this.channel.feeds.splice(index, 1);
			this.saveChannel();
		}
	}

	validFeed( feed?:Feed ){
		return (feed && feed.title && feed.title.trim()!=="" && feed.link && feed.link.trim()!=="");
	}
	
	saveFeed(){
		if(this.selectedFeedIndex && this.validFeed(this.selectedFeed)){
			if( this.selectedFeed ) {
				if(this.selectedFeedIndex >= 0 && this.selectedFeedIndex < this.totalFeeds){
					this.channel.feeds[this.selectedFeedIndex] = this.selectedFeed;
				}else{
					this.channel.feeds.push(this.selectedFeed);
				}
				this.saveChannel();
			}
		}
		this.closeFeedEdition();
	}

	saveChannel(){
		if(this.channel._id) {
			this.editChannel();
		}
		else{
			this.createChannel();
		}
	}

	createChannel() {
		if(this.channel){
			TransportFrameworkFactory.instance().http.postJson('/rss/channel', this.channel)
			.then( response => {
				this.channel._id = response._id;
				this.loadFeeds(0); // 0 : default, from the cache
			});
		} else {
			console.log("createChannel : channel is undefined");
		}
	}
	
	editChannel() {
		if(this.channel && this.channel._id){
			TransportFrameworkFactory.instance().http.putJson('/rss/channel/' + this.channel._id, {feeds: this.channel.feeds})
			.then( response => {
				this.loadFeeds(0); // 0 : default, from the cache
			});
		} else {
			console.log("editChannel : channel is undefined");
		}
	}
	
	showOrHideFeed( index:number ){
		if(this.display.selectedFeed === index){
			this.display.selectedFeed = undefined;
		} else {
			this.display.selectedFeed = index;
		}
	}
	
	formatDate( date:any ){
		var momentDate;
		if (typeof date === "number"){
			momentDate = L10n.unix(date);
		} else {
			momentDate = L10n.moment(date, undefined, 'en');
		}
		return momentDate.lang('fr').format('dddd DD MMMM YYYY HH:mm');
	};
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./rss-widget.widget.html').default;
	controller = [Controller];
	controllerAs = 'ctrl';
    require = ['odeRssWidget'];

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		// init channel & feeds
		ctrl.initFeeds().then( () => {
			scope.$apply();
		});
	}
}

/** The rss-widget widget. */
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
export const odeModuleName = "odeRssWidgetModule";
angular.module( odeModuleName, []).directive( "odeRssWidget", DirectiveFactory );
