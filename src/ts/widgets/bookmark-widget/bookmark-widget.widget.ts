import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { TransportFrameworkFactory } from "ode-ts-client";
import moment from 'moment'; // FIXME : should we use moment anymore ?
import { notify } from "../../services";

// UTILS
function isEmpty(str:string) {
	return (!str || str.trim().length === 0);
}
function http() {
	return TransportFrameworkFactory.instance().http;
}

// TYPES
interface IBookmark {
	_id?: string;
	name: string;
	url: string;
}

interface IBookmarkMetadata {
	_id:{$oid: string};
	owner: {
		  userId: string;
		  displayName: string;
	},
	bookmarks: IBookmark[];
	modified: {$date: number};
	created: {$date: number};
}

class Bookmark implements IBookmark {
	_id?: string;
	name: string;
	url: string;

	constructor( model?:IBookmark ) {
		this.name = "";
		this.url = "";
		this.flatCopy(model);
	}

	flatCopy( model?:IBookmark ):Bookmark {
		if( model ) {
			Object.assign(this, model);
		}
		return this;
	}

	create():Promise<Bookmark> {
		if (isEmpty(this.name)) {
			notify.error('bookmark.widget.form.name.is.empty');
			return Promise.reject();
		}
		if (isEmpty(this.url)) {
			notify.error('bookmark.widget.form.url.is.empty');
			return Promise.reject();
		}
	
		return http().postJson<IBookmark,IBookmark>('/bookmark', this)
		.then( response => {
			return this.flatCopy( response );
		})
		.catch( e => {
			if( http().latestResponse.status===400 ) {
				notify.error(JSON.parse(http().latestResponse.statusText).error); // FIXME check it is working fine.
			}
			throw e;
		});
	}
	
	update() {
		if (isEmpty(this.name)) {
			notify.error('bookmark.widget.form.name.is.empty');
			return Promise.reject();
		}
		if (isEmpty(this.url)) {
			notify.error('bookmark.widget.form.url.is.empty');
			return Promise.reject();
		}
	
		return http().putJson(`/bookmark/${this._id}`, this)
		.then( () => this )
		.catch( e => {
			if( http().latestResponse.status===400 ) {
				notify.error(JSON.parse(http().latestResponse.statusText).error); // FIXME check it is working fine.
			}
			throw e;
		});
	}
	
	delete() {
		return http().delete(`/bookmark/${this._id}`)
		.then( () => this );
	}
	
	toJSON() {
		var json = {
				name : this.name,
				url : this.url
			};
		return json;
	}
}

/* Controller for the directive */
class Controller implements IController {
	bookmarks: Bookmark[] = [];
	createdBookmark?: Bookmark;
	editedBookmark?: Bookmark;
	display = {
		manage: false,
	};
	public apply?:()=>void;

	public getBookmarks():Promise<void> {
		return http().get<IBookmarkMetadata>('/bookmark')
		.then( response => {
			if(response && response.bookmarks) {
				this.bookmarks = response.bookmarks.map( b => new Bookmark(b) );
			} else {
				this.bookmarks = [];
			}
			this.apply && this.apply();
		});
	}

	createBookmark() {
		if( this.createdBookmark ) {
			this.createdBookmark.create().then( b => {
				this.bookmarks.push( b );
				this.cancelCreate();
				this.apply && this.apply();
			});
		}
	}
	
	updateBookmark() {
		if( this.editedBookmark ) {
			const edited = this.editedBookmark;
			edited.update()
			.then( () => {
				const aBookmark = this.bookmarks.find( pBookmark => pBookmark._id===edited._id );
				aBookmark?.flatCopy( edited );
				this.cancelEdit();
				this.apply && this.apply();
			});
		}
	}

	deleteBookmark( b:Bookmark ) {
		b.delete().then( b => {
			let index = this.bookmarks.indexOf(b);
			this.bookmarks.splice(index, 1);
			this.cancelEdit(); // just in case
			this.apply && this.apply();
		});
	}
	
	// Controller
	newBookmark() {
		this.createdBookmark = new Bookmark( {url: "http://", name:""} );
		this.cancelEdit();
	}
	
	editBookmark(bookmark:IBookmark) {
		this.editedBookmark = new Bookmark( bookmark );
		this.cancelCreate();
	}
	
	cancelCreate() {
		this.createdBookmark = undefined;
	}

	cancelEdit() {
		this.editedBookmark = undefined;
	}
}

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	template = require('./bookmark-widget.widget.html').default;
	controller = [Controller];
	controllerAs = 'ctrl';

    link(scope:IScope, elem:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
        const ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
		if( ! ctrl ) return;

		ctrl.getBookmarks().then( () => {
			scope.$apply();
		});

		ctrl.apply = () => {
			scope.$apply();
		};

	}
}

/** The rss-widget widget. */
function DirectiveFactory() {
	return new Directive();
}

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORING THE MODULE NAME :
export const odeModuleName = "odeBookmarkWidgetModule";
angular.module( odeModuleName, []).directive( "odeBookmarkWidget", DirectiveFactory );
