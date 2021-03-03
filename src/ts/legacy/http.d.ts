export declare function Http(): void;
export declare var http: () => any;
export declare let toFormData: (obj) => string;
/**
 * Promisified HTTP
 */
export declare type PromiseHttp<T> = Promise<T> & {
    e400: (e) => void;
};
export declare class HttpPromisified<T> {
    private inner;
    constructor(inner?: any);
    private promisify(req);
    get(url: string, params?: any): PromiseHttp<T>;
    post(url: string, params?: any): PromiseHttp<T>;
    postFile(url: string, data: any, params?: any): PromiseHttp<T>;
    postJson(url: string, json: any): PromiseHttp<T>;
    put(url: string, data?: any): PromiseHttp<T>;
    putJson(url: string, json: any): PromiseHttp<T>;
    delete(url: string): PromiseHttp<T>;
    deleteJson(url: string, json: any): PromiseHttp<T>;
    putFile(url: string, data: FormData, opt?: any): PromiseHttp<T>;
}
export declare function httpPromisy<T>(inner?: any): HttpPromisified<T>;
