export declare interface Idiom {
    promises: any;
    translate: (key:string)=>string;
    addBundlePromise: (s:string) => Promise<any>;
    addBundle: (s:string, f:Function) => void;
    addTranslations: (s:string, f:Function) => void;
    addKeys: (k:any) => void;
    removeAccents: (s:string) => string;
    addDirectives: (module:angular.IModule) => void;
}
