import { IFilterFunction } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const Filter:IFilterFunction = (input:string) => {
    return ConfigurationFrameworkFactory.instance().Platform.idiom.translate(input);
}

export function FilterFactory() {
    return Filter;
}
