import { EventName, EVENT_NAME, IWidget, LayerName, LAYER_NAME, WidgetFrameworkFactory, RxJS } from "ode-ts-client";
import { notif } from "../utils";

/** The widget loader service. */
export class WidgetService {

    /** Loads the widget configuration. */
    public initialize():Promise<void> {
        return WidgetFrameworkFactory.instance().initialize(null, null);
    }

    /** List widgets that are visible to the connected user. */
    public list():IWidget[] {
        return WidgetFrameworkFactory.instance().list;
    }

    /** Get notified when the widgets preferences changed. */
    public onChange():RxJS.Observable<{name:EventName, layer:LayerName|string, data?: any}> {
        return notif().events().pipe(
            RxJS.filter( e => e.layer===LAYER_NAME.WIDGETS && e.name===EVENT_NAME.USERPREF_CHANGED )
        );
    }
}
