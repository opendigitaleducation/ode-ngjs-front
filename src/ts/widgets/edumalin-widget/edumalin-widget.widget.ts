import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { conf, notif, http, session, Base64 } from "../../utils";
import moment from "moment";

class Controller implements IController {
  data: any = {};
  error: any = null;
  public currentWidget: any;
  public showLightbox = false;

  urlGar: string =
    "https://idp-auth.gar.education.fr/domaineGar?idENT=ID_ENT&idEtab=ID_ETAB&idRessource=ark:/19496/UVdpWxn8N78r24";

  onButtonClick(link: string, eventType: String) {
    // Track this event.
    if (eventType && eventType.length > 0) {
      this.trackEvent(eventType);
    }

    window.open(link, "_blank");
  }

  protected get isDataLoaded() {
    return this.data.length > 0;
  }

  dateFormat(dateTime: any) {
    let date = moment(dateTime).format("L");
    return date;
  }

  isTypeRDV(type: any) {
    return type == "RDV";
  }

  isTypeWebinaire(type: any) {
    return type == "Webinaire";
  }

  displayIcon(type: any) {
    switch (type) {
      case "RDV":
        return "fa-calendar-alt";
      case "Webinaire":
        return "fa-video";
      case "Annonce":
        return "fa-bullhorn";
      case "Actualité":
        return "fa-newspaper";
      case "Temoignage":
        return "fa-microphone-lines";
      case "Podcast":
        return "fa-headset";
      case "Replay":
        return "fa-rotate-left";
      case "Tutoriel":
        return "fa-wand-magic-sparkles";
      default:
        return "fa-info";
    }
  }

  displayIconColor(type: any) {
    switch (type) {
      case "RDV":
        return "#2a9cc8";
      case "Webinaire":
        return "#20c997";
      case "Annonce":
        return "#E13A3A";
      case "Actualité":
        return "#FF8D2E";
      case "Temoignage":
        return "#2029B6";
      case "Podcast":
        return "#823AA1";
      case "Replay":
        return "#46BFAF";
      case "Tutoriel":
        return "#ecbe30";
      default:
        return "#f59700";
    }
  }

  openLightBox(contentType: any, e: Event) {
    this.currentWidget = contentType;
    this.showLightbox = true;

    // Track this event.
    if (e.currentTarget) {
      this.trackEvent("EDUMALIN_OPEN_MODAL");
    }
  }

  isURL(str: String) {
    if (
      str &&
      str.length > 0 &&
      (str.startsWith("http://") || str.startsWith("https://"))
    ) {
      return true;
    }
    return false;
  }

  generateLinkGar() {
    if (
      session().description &&
      session().description.schools &&
      session().description.schools.length > 0
    ) {
      let school = session().description.schools[0];
      let UAIb64: string = Base64.encode(school?.UAI != null ? school.UAI : "");
      let exports: string[] = school.exports != null ? school.exports : [];
      let codeGar = "";
      if (exports != null) {
        for (let i = 0; i < exports.length; ++i)
          if (exports[i].startsWith("GAR-")) {
            codeGar = exports[i].replace("GAR-", "");
            break;
          }
        if (codeGar == "") codeGar = exports[0];
      }
      let codeGARb64 = Base64.encode(codeGar);

      return this.urlGar
        .replace("ID_ETAB", UAIb64)
        .replace("ID_ENT", codeGARb64);
    }

    return "https://edumalin.fr/";
  }

  // Give an opportunity to track some events from outside of this component.
  protected trackEvent(eventType: String) {
    // Track this event.
    if (eventType && eventType.length > 0) {
      const eventJson: any = {
        "event-type": eventType,
        modal: "Timeline",
      };

      http()
        .post("/infra/event/web/store", eventJson)
        .catch((e) => {
          console.debug("[TrackingInternal] failed to trackEvent: ", e);
        });
    }
  }

  encodeUrlPicture(url: string) {
    return encodeURI(url);
  }
}

/* Directive */
class Directive
  implements IDirective<IScope, JQLite, IAttributes, IController[]>
{
  restrict = "E";
  template = require("./edumalin-widget.widget.html").default;
  scope = {};
  bindToController = true;
  controller = [Controller];
  controllerAs = "ctrl";
  require = ["odeEdumalinWidget"];

  async link(
    scope: IScope,
    elem: JQLite,
    attrs: IAttributes,
    controllers?: IController[]
  ) {
    const ctrl: Controller | null = controllers
      ? (controllers[0] as Controller)
      : null;
    if (!ctrl) {
      return;
    }

    await http()
      .get("/appregistry/edumalin/widget")
      .then((response) => {
        if (response.success) {
          ctrl.data = response.data;
          scope.$apply();
        } else {
          ctrl.error = response.error;
        }
      });
  }
}

/** The edumalin widget. */
function DirectiveFactory() {
  return new Directive();
}

// Preload translations
notif()
  .onLangReady()
  .promise.then((lang) => {
    switch (lang) {
      default:
        conf().Platform.idiom.addKeys(require("./i18n/fr.json"));
        break;
    }
  });

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeEdumalinWidgetModule";
angular
  .module(odeModuleName, [])
  .directive("odeEdumalinWidget", DirectiveFactory);
