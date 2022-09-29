import { IFilterFunction } from "angular";
import { conf } from "../../../utils";

const Filter:IFilterFunction = (input:string, params?:any) => {
    return conf().Platform.idiom.translate(input, params);
}

export function FilterFactory() {
    return Filter;
}
