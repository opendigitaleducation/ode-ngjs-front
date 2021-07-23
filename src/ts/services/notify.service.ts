import { ConfigurationFrameworkFactory } from "ode-ts-client";
const humane = require('humane-js');

/**
 * This service can display on-screen notifications to the user.
 * 3 levels of attention available : error (in red), info (neutral color), success (green)
 * Based on humane-js
 */
export class NotifyService {
    private message(type:"error"|"info"|"success", message:string, timeout?:number) {
		message = ConfigurationFrameworkFactory.instance().Platform.idiom.translate(message);
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

export const notify = new NotifyService();