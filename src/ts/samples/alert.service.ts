import { IWindowService } from "angular";

export class AlertSvc {
    constructor(private $window:IWindowService) {
    }

    alert( msg:string ) {
        this.$window.alert( msg ?? "Undefined message..." );
    }
}

/**
 * Service factory, with dependencies injected as required by $inject below.
 * @param $window 
 * @returns 
 */
export function ServiceFactory($window:IWindowService) {
	return new AlertSvc($window);
}
ServiceFactory.$inject= ["$window"];