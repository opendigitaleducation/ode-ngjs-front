import { IFilterFunction } from "angular";
import { ConfigurationFrameworkFactory } from "ode-ts-client";

const idiom = ConfigurationFrameworkFactory.instance.idiom;

const Filter:IFilterFunction = (input:string) => {
    return idiom.translate(input);
}

export function FilterFactory() {
    return Filter;
}
