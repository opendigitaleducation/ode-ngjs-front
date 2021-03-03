export interface Shareable {
    shared: any;
    owner: {
        userId: string;
        displayName: string;
    };
    myRights: any;
}
export interface ShareVisible {
    id: string;
    name: string;
    groupDisplayName?: string;
    structureName?: string;
    actions?: any;
}
export interface ShareAction {
    name: string[];
    displayName: string;
    type: string;
    priority?: number;
    requires?: any;
}
export interface ShareInfosDetail {
    checked: {
        [key: string]: string[];
    };
    checkedInherited: {
        [key: string]: string[];
    };
    visibles: ShareVisible[];
}
export interface ShareInfos {
    actions: ShareAction[];
    groups: ShareInfosDetail;
    users: ShareInfosDetail;
}
export interface SharePayload {
    groups?: {
        [key: string]: string[];
    };
    bookmarks?: {
        [key: string]: string[];
    };
    users?: {
        [key: string]: string[];
    };
}
export declare class Rights<T extends Shareable> {
    private resource;
    constructor(resource: T);
    myRights: any;
    isOwner(): boolean;
    fromBehaviours(prefix?: string): Promise<any>;
    fromObject(obj: any, prefix: string): Promise<any>;
}
