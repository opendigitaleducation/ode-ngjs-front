import angular from "angular";

export class NgHelperService {
    // /** Replacement for $(selector) a.k.a. jQuery(selector)  */
    // public querySelect(selector:string):JQLite {
    //     return angular.element(document.querySelectorAll(selector));
    // }

    /** Replacement for $.each() */
    public each( set:JQLite, cb:(index:number, elem:HTMLElement)=>void ) {
		for( let i=0; i<set?.length; i++ ) {
            cb( i, set[i] );
		}
    }

    /** Replacement for $.offset() */
    public offset(set:JQLite, val?:{top:number, left:number}): {top:number, left:number} {
        if( typeof val!=="undefined" ) {
            set.css('position','relative').css('top',''+val.top+'px').css('left',''+val.left+'px');
        }

        if(!set[0].getClientRects().length) {
            return { top:0, left:0 };
        }
        const rect = set[0].getBoundingClientRect();
        return {
            top:  rect.top  + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

    /** Replacement for $.width() */
    public width(set:JQLite): number {
        return parseFloat(getComputedStyle(set[0], null).width.replace("px", "")) || 0;
    }

    /** Replacement for $.height() */
    public height(set:JQLite): number {
        return parseFloat(getComputedStyle(set[0], null).height.replace("px", "")) || 0;
    }

    /** Replacement for $.parents(selector) */
    public parents(set:JQLite, selector:string) {
        let ret:JQLite = angular.element("<div></div>");
		for( let i=0; i<set?.length; i++ ) {
			let parent = set[i];
			do {
				parent = parent.parentNode as HTMLElement;
                if( parent.matches(selector) ) {
                    ret.append( parent );
                }
			} while( parent );
        };
        return ret.children();
    }

    /** Available width for rendering the HTML document, in pixels. */
    public get viewport():number {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        return vw;
    }

    // Commonly defined breakpoints in CSS
    public get WIDE_SCREEN():number     { return 1200; };
    public get TABLET():number          { return 800; };
    public get FAT_MOBILE():number      { return 550; };
    public get SMALL_MOBILE():number    { return 420; };
    /*
    checkMaxWidth: function (size) {
        if (this[size]) {
            return window.matchMedia("(max-width: " + this[size] + "px)").matches
        } else {
            return window.matchMedia("(max-width: " + size + "px)").matches
        }
    }
*/
}
