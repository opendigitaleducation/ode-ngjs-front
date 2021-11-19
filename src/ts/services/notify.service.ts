import angular from "angular";
import { conf } from "../utils";
const humane = require('humane-js');

//FIXME define the correct CSS in BT framework
angular.element("head").append( 
`<style id="humane-js">
    .humane,
    .humane-original {
      position: fixed;
      -moz-transition: all 0.2s ease-out;
      -webkit-transition: all 0.2s ease-out;
      -ms-transition: all 0.2s ease-out;
      -o-transition: all 0.2s ease-out;
      transition: all 0.2s ease-out;
      z-index: 100000;
      filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);
    }
    .humane,
    .humane-original {
      font-family: Ubuntu, Verdana, sans-serif;
      line-height: 40px;
      font-size: 25px;
      top: 25%;
      left: 25%;
      opacity: 0;
      width: 50%;
      min-height: 40px;
      padding: 10px;
      text-align: center;
      background-color: #000;
      color: #fff;
      -webkit-border-radius: 15px;
      border-radius: 15px;
    }
    .humane p,
    .humane-original p,
    .humane ul,
    .humane-original ul {
      margin: 0;
      padding: 0;
    }
    .humane ul,
    .humane-original ul {
      list-style: none;
    }
    .humane.humane-original-info,
    .humane-original.humane-original-info {
      background-color: #030;
    }
    .humane.humane-original-success,
    .humane-original.humane-original-success {
      background-color: #030;
    }
    .humane.humane-original-error,
    .humane-original.humane-original-error {
      background-color: #300;
    }
    .humane.humane-animate,
    .humane-original.humane-original-animate {
      opacity: 0.8;
    }
    .humane.humane-animate:hover,
    .humane-original.humane-original-animate:hover {
      opacity: 0.6;
    }
    .humane.humane-js-animate,
    .humane-original.humane-original-js-animate {
      opacity: 0.8;
    }
    .humane.humane-js-animate:hover,
    .humane-original.humane-original-js-animate:hover {
      opacity: 0.6;
      filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=60);
    }
</style>`    
);

/**
 * This service can display on-screen notifications to the user.
 * 3 levels of attention available : error (in red), info (neutral color), success (green)
 * Based on humane-js
 */
export class NotifyService {
    private message(type:"error"|"info"|"success", message:string, timeout?:number) {
		message = conf().Platform.idiom.translate(message);
		let options:any = { addnCls: 'humane-original-'+ type };
		if(typeof timeout === "number")
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