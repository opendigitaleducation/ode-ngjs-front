import { ConfigurationFrameworkFactory, IWebApp, NotifyFrameworkFactory, SessionFrameworkFactory } from "ode-ts-client";

export class SessionService {

    public hasWorkflow(right:string):boolean {
        return SessionFrameworkFactory.instance().session.hasWorkflow(right);
    }

	public getLanguage():Promise<string> {
		return NotifyFrameworkFactory.instance().onSessionReady().promise
		.then( userInfo => SessionFrameworkFactory.instance().session.currentLanguage );
	}

	public getBookmarks():Promise<IWebApp[]> {
		return NotifyFrameworkFactory.instance().onSessionReady().promise
		.then( userInfo => ConfigurationFrameworkFactory.instance().User.bookmarkedApps );
	}

}
