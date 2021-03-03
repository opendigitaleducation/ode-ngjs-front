import { Shareable } from './rights';

export interface IBehavioursActions {
    error(cb: Function): void;
}
export interface IBehavioursCopyRightsParams {
    provider: { resource: Shareable, application: string }, 
    target: { resources: Shareable[], application: string }
}
export interface IBehavioursAppBehaviours {
    model: any;
    rights: { resource:any, workflow:any };
    loadResources(): Promise<any>;
    sniplets: any; 
}
export declare interface IBehaviours {
    storedRights: any;
    sharingRights(): Promise<any>;
    appSharingRights( prefix:string ): Promise<any>;
    copyRights( params:IBehavioursCopyRightsParams ): Promise<void>;
	register( application:string, appBehaviours:any ): void;
    findRights( serviceName:string, resource:IBehavioursAppBehaviours ): Promise<any>;
    // @deprecated findBehaviours(serviceName, resource): void;
    loadBehaviours( serviceName:string, callback: ((resource:IBehavioursAppBehaviours)=>void) ): IBehavioursActions;
    load( serviceName:string ): Promise<any>;
    findWorkflow( serviceName:string ): Promise<any>;
    workflowsFrom( obj:any, dependencies:any ): {};
	applicationsBehaviours: any;
}