export declare interface Idiom {
    promises: any;
    translate: function(string):string;
    addBundlePromise: function(string):Promise;
    addBundle: function(string,Function):void;
    addTranslations: function(string,Function):void;
    addKeys: function(any):void;
    removeAccents: function(string):string;
    addDirectives: function(angular.IModule):void;
}
