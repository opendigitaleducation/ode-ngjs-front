import { IWebApp } from "ode-ts-client";
import { conf, notif, session } from "../utils";

export class SessionService {

    public hasWorkflow(right:string):boolean {
        return session().hasWorkflow(right);
    }

	public getLanguage():Promise<string> {
		return notif().onSessionReady().promise
		.then( userInfo => session().currentLanguage );
	}

	public getBookmarks():Promise<IWebApp[]> {
		return notif().onSessionReady().promise
		.then( userInfo => conf().User.bookmarkedApps );
	}

}
