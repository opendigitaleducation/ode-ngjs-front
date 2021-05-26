import { ConfigurationFrameworkFactory } from "ode-ts-client";

const humane = require('humane-js');
const lang = ConfigurationFrameworkFactory.instance().Platform.idiom;

export class NotifyService {
    private message(type:"error"|"info"|"success", message:string, timeout?:number) {
		message = lang.translate(message);
		let options:any = { addnCls: 'humane-original-'+ type };
		if(timeout != null)
			options["timeout"] = timeout;
		humane.spawn(options)(message);
    }

	error(message:string, timeout?:number):void {
        this.message("error", message, timeout);
    }

	info(message:string, timeout?:number):void {
        this.message("info", message, timeout);
    }

	success(message:string, timeout?:number):void {
        this.message("success", message, timeout);
    }
}
