import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { USER_PREFS } from "ode-ts-client";
import { conf, notif, http } from "../../utils";

/* Controller for the directive */
class Controller implements IController {
  cardNb?: string;
  sales?: any[];

  // Flags
  loads: boolean = false;
  error: boolean = false;

  // Angular model
  inputCardNb: string = "";
  // Shortcut for refreshing the view.
  public apply?: () => void;

  private get version(): string {
    return conf().Platform.deploymentTag;
  }

  logout() {
    delete this.cardNb;
    delete this.sales;
    return conf().User.preferences
      .update(USER_PREFS.CURSUS, {})
      .save(USER_PREFS.CURSUS);
  }

  connect(cardNb: string) {
    this.cardNb = cardNb;
    this.loads = true;
    return this.getSales().finally(() => {
      this.loads = false;
      this.apply && this.apply();
    });
  }

  getCardNb() {
    return conf().User.preferences
      .load(USER_PREFS.CURSUS)
      .then(({cardNb}) => {
        this.cardNb = cardNb;
      });
  }

  setCardNb(cardNb: string) {
    return conf().User.preferences
      .update(USER_PREFS.CURSUS, { cardNb: cardNb })
      .save(USER_PREFS.CURSUS);
  }

  getSales() {
    if (!this.cardNb) {
      return Promise.reject();
    }
    return http()
      .get("/cursus/sales", {
        queryParams: {
          "cardNb": this.cardNb,
          "_": this.version
        }
      })
      .then((data: { sales: any[], wallets: any[] }) => {
        if( http().latestResponse.status !== 200 ) {
          throw "Cannot get sales";
        }
        this.error = false;
        this.cardNb && this.setCardNb(this.cardNb);
        this.sales = data.sales;
        if (this.sales && data.wallets) {
          this.sales.forEach(sale => {
            sale.wallet = data.wallets.find(w => {
              return w && w.code == sale.numPM;
            });
          });
        }
        return data;
      })
      .catch(e => {
        this.error = true;
      })
      .finally(() => {
        this.apply && this.apply();
      });
  }

  formatSolde(soldeStr: string) {
    if (typeof soldeStr !== "string" || soldeStr.length === 0) {
      return soldeStr;
    } else if (soldeStr.length === 1) {
      return "0,0" + soldeStr;
    } else if (soldeStr.length === 2) {
      return "0," + soldeStr;
    } else {
      return (soldeStr.substring(0, soldeStr.length - 2)) + "," + (soldeStr.substring(soldeStr.length - 2));
    }
  };
}

/* Directive */
class Directive implements IDirective<IScope, JQLite, IAttributes, IController[]> {
  restrict = 'E';
  template = require('./cursus-widget.widget.html').default;
  controller = [Controller];
  controllerAs = 'ctrl';
  require = ['odeCursusWidget'];

  link(scope: IScope, elem: JQLite, attrs: IAttributes, controllers?: IController[]): void {
    const ctrl: Controller | null = controllers ? controllers[0] as Controller : null;
    if (!ctrl) return;
    ctrl.apply = () => {
      scope.$apply();
    };
    ctrl.loads = true;
    ctrl.getCardNb().then(() => {
      return ctrl.getSales();
    }).finally(() => {
      ctrl.loads = false;
      scope.$apply();
    });
  }
}

/** The my-apps widget. */
function DirectiveFactory() {
  return new Directive();
}

// Preload translations
notif().onLangReady().promise.then(lang => {
  switch (lang) {
    default: conf().Platform.idiom.addKeys(require('./i18n/fr.json')); break;
  }
});

// THIS ANGULAR MODULE WILL BE DYNAMICALLY ADDED TO THE APPLICATION.
// RESPECT THE NAMING CONVENTION BY EXPORTING THE MODULE NAME :
export const odeModuleName = "odeCursusWidgetModule";
angular.module(odeModuleName, []).directive("odeCursusWidget", DirectiveFactory);
