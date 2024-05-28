import angular, {IAttributes, ICompileService, IController, IDirective} from "angular";
import {conf, notif, TrackedScope, TrackedAction, TrackedActionFromWidget, http} from "../../utils";

type Resource = {
    authors: string[];
    date: number;
    description: string;
    disciplines: string[];
    displayTitle: string;
    document_types: string[];
    editors: string[];
    hash: number;
    id: string;
    favorite?: boolean;
    image: string;
    levels: string[];
    link: string;
    plain_text: string[];
    source: string;
    title: string;
    action: object;
    structure_name: string;
    structure_uai: string;
    display_structure_name?: boolean;
    _id?: string;

    user?: string;
    favoriteId?: string;
}

type Response = {
    data: Resource[];
    event: string;
    state: string;
    status: string;
}

/* Controller for the directive */
class Controller implements IController {
    private resources: Resource[] = [];
    private limitResources: number = 4; // limit of resources to display
    public hasUniversalis: boolean = false;

    public initResources = async(): Promise<void> => {
        await this.initResourcesFavorites();
        await this.initSignetFavorites();
        await this.hasUniversalisResource();
        if (this.resources.length > this.limitResources) this.resources = this.resources.slice(0, this.limitResources);
    }

    private fetchFavorites = async (apiUrl: string): Promise<void> => {
        try {
            let response: Response = await http().get<Response>(apiUrl);
            if (response.status ===  "ok" && response && response.data && response.data.length > 0) {
                let favoriteResources: Resource[] = response.data as Resource[];
                this.resources = this.resources.concat(favoriteResources);
            }
        } catch (e) {
            console.warn(`[widget.mediacentre] Failed to fetch favorites : `, e);
            throw e;
        }
    }

    private initResourcesFavorites = async(): Promise<void> => {
        try {
            await this.fetchFavorites('/mediacentre/favorites');
        } catch (e) {
            console.warn("[widget.mediacentre] Failed to initResourcesFavorites : ", e);
            throw e;
        }
    }

    private initSignetFavorites = async(): Promise<void> => {
        try {
            await this.fetchFavorites('/mediacentre/signets/favorites');
        } catch (e) {
            console.warn("[widget.mediacentre] Failed to initSignetFavorites : ", e);
            throw e;
        }
    }

    private hasUniversalisResource = async(): Promise<void> => {
        try {
            let universalisResource: Resource = await http().get<Resource>('/mediacentre/resource/universalis');
            this.hasUniversalis = !!universalisResource;
        } catch (e) {
            console.warn("[widget.mediacentre] Failed to check exitence of universalis resource: ", e);
            throw e;
        }
    }
}

/* Directive */
class Directive implements IDirective<TrackedScope,JQLite,IAttributes,IController[]> {
    restrict = 'E';
    template = require('./mediacentre-widget.widget.html').default;
    scope = {};
    bindToController = true;
    controller = [Controller];
    controllerAs = 'ctrl';
    require = ['odeMediacentreWidget'];

    link (scope:TrackedScope, elem:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const ctrl: Controller|null = controllers ? controllers[0] as Controller : null;
        if (!ctrl) return;

        // Init resources
        ctrl.initResources().then(() => {
            if (ctrl.hasUniversalis) { // Display Universalis widget
                setTimeout(() => {
                    const htmlFragment = `<ode-universalis-widget></ode-universalis-widget>`;
                    const compiled = this.$compile(htmlFragment)(scope);
                    let universalisContainer = elem.find("#universalis-container");
                    if (universalisContainer) universalisContainer.append(compiled);
                    scope.$apply();
                }, 100);
            }
            scope.$apply();
        });

        // Give an opportunity to track some events from outside of this widget.
        scope.trackEvent = (e:Event, p:CustomEventInit<TrackedAction>): void => {
            // Allow events to bubble up.
            if (typeof p.bubbles === "undefined") p.bubbles = true;

            let event = null;
            if (p && p.detail?.open === 'more') {
                event = new CustomEvent( TrackedActionFromWidget.mediacentre, p );
            }
            if (event && e.currentTarget) {
                e.currentTarget.dispatchEvent(event);
            }
        }
    }

    constructor (private $compile: ICompileService) { }
}

/** The mediacentre widget. */
function DirectiveFactory($compile:ICompileService) {
    return new Directive($compile);
}
DirectiveFactory.$inject = ["$compile"];

// Preload translations
notif().onLangReady().promise.then((lang: any): void => {
    switch (lang) {
        default:	conf().Platform.idiom.addKeys( require('./i18n/fr.json') ); break;
    }
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeMediacentreWidgetModule";
angular.module( odeModuleName, []).directive( "odeMediacentreWidget", DirectiveFactory );
