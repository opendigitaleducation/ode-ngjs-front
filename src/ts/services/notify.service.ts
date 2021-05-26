// FIXME legacy stuff
declare namespace notify {
    let message: (t:"error"|"info"|"success", message:string, timeout?:number) => void;
	let error: (message:string, timeout?:number) => void;
	let info: (message:string, timeout?:number) => void;
	let success: (message:string, timeout?:number) => void;
};

export class NotifyService {
	error(message:string, timeout?:number):void {
        notify.message("error", message, timeout);
    }

	info(message:string, timeout?:number):void {
        notify.message("info", message, timeout);
    }

	success(message:string, timeout?:number):void {
        notify.message("success", message, timeout);
    }

    
}
