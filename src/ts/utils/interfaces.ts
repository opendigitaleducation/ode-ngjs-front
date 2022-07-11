/** These statuses are sent to the callbacks registered with the state(cb) method. */
export type RecorderState = 'idle'|'preparing'|'recording'|'suspended'|'paused'|'playing'|'stopped'|'uploading'|'encoding'|'saved';
export type RecorderPermission = 'idle'|'granted'|'denied';
/**
 * Any recorder plugged to the recorder widget must implement this interface.
 */
export interface IAnyRecorder {
    title:string;
    readonly state: RecorderState;
    readonly permission: RecorderPermission;
    elapsedTime:number;
    status(callback:(state:RecorderState)=>void):void;
    pause():void;
    play():void;
    suspend():Promise<void>;
    record():Promise<void>;
    prepare?():void;
    flush():void;
    save():void;
}

