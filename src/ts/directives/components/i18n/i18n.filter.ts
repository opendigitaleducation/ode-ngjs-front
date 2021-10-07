import { IFilterFunction } from "angular";
import { conf } from "../../../utils";

const Filter:IFilterFunction = (input:string) => {
    return conf().Platform.idiom.translate(input);
}

export function FilterFactory() {
    return Filter;
}
