import { SessionFrameworkFactory } from "ode-ts-client";

export class SessionService {

    public hasWorkflow(right:string):boolean {
        return SessionFrameworkFactory.instance().session.hasWorkflow(right);
    }
}
