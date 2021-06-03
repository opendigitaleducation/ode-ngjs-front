import { IAttributes, IController, IDirective, IScope } from "angular";

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
	transclude = true;
	templateUrl(element:JQLite, attrs:IAttributes) {
		// Load the specified template-url, or the default implementation.
		return attrs.templateUrl ? attrs.templateUrl : require('./portal.directive.lazy.html').default;
	};
	scope = {
		title:"@"
	};

/*TODO finir le portage de la directive portal (tracking)

	compile(element:JQLite, attributes:IAttributes, transclude){
		// Initialize any configured tracker
		tracker.init();
	
		$("html").addClass("portal-container")
		element.find('[logout]').attr('href', '/auth/logout?callback=' + skin.logoutCallback);
		
		if (!attributes.templateUrl) {
			ui.setStyle(skin.theme);
		}
		
		Http.prototype.bind('disconnected', function(){
			window.location.href = '/';
		})
		
		return function postLink( scope, element, attributes, controller, transcludeFn ) {
			scope.template = template;
			// Create the banner to display
			scope.isTrackerInitialized = function() {
				return tracker.isInitialized;
			}
			var bannerCode = ' \
				<infotip name="rgpd-cookies-banner" class="info modal" style="position:fixed; bottom:0; right:20px;" \
						save-preference-under="tracking" \
						show-once="true" \
						ng-show="isTrackerInitialized()" > \
					<p><i18n>rgpd.cookies.banner.text1</i18n> &nbsp; <a href="/userbook/mon-compte?show=rgpd_cookies"><strong><i18n>rgpd.cookies.banner.link</i18n></strong></a>.</p> \
				</infotip> \
			';
			element.prepend( $compile(bannerCode)(scope) );
		};
	}
*/
}

/** The portal directive.
 *
 * Usage:
 *      &lt;ode-portal title="My app"></ode-portal&gt;
 * or
 *      &lt;ode-portal template-url="/platform/assets/themes/...."></ode-portal&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}