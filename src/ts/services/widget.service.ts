import { IWidget, TransportFrameworkFactory, WidgetFrameworkFactory } from "ode-ts-client";

const http = TransportFrameworkFactory.instance().http;

/** The widget loader service. */
export class WidgetService {

    public initialize():Promise<void> {
        return WidgetFrameworkFactory.instance().initialize(null, null);
    }

    public list():IWidget[] {
        return WidgetFrameworkFactory.instance().list;
    }


}
