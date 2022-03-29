import { APP, IHttpResponse } from "ode-ts-client";
import { conf, http } from "../utils";
import { VideoEventTrackerService } from "./video-event-tracker.service";

//-------------------------------------
export interface IVideoUploader {
//-------------------------------------
    /** Accepted file extensions of videos UPLOADED to the server. */
    readonly validExtensions: string[];
    /** Maximum file weight, in Mbytes, of videos UPLOADED to the server. */
    readonly maxWeight: number;
    /** Maximum duration, in minutes, of videos RECORDED on a client software. */
    readonly maxDuration: number;
    /** Check if an extension is valid, whatever its case. */
    checkValidExtension(ext:string):boolean;
    /** Upload a video to the server. */
    upload(file:Blob, filename:string, captation:boolean, duration?:string|number):Promise<IVideoUploadResult>;
};

//-------------------------------------
export type IVideoUploadResult = {
//-------------------------------------
    /** Result of the upload+encode flow. */
    state:"running"|"succeed"|"error";
    /** ID of the video file. */
    videoid?: string;
    /** size of the encoded video, in bytes. */
    videosize:number;
    /** ID of the video document in Workspace. */
    videoworkspaceid: string;
    /** Error code (i18n key), when state==="error" */
    code?:string;
}

//-------------------------------------
type UploadResponse = IHttpResponse & {
//-------------------------------------
    data: IVideoUploadResult & { processid:string; }
};

/**
 * This utility class allows uploading videos to the server, as documents.
 * Each video can be either recorded (Blob) or chosen from the local storage (File).
 * The server will process each uploaded video and convert them to a streamable format.
 */
//-------------------------------------
export class VideoUploadService implements IVideoUploader {
//-------------------------------------
    private _maxWeight   = 50;  // in Mbytes. Applies to uploaded videos.
    private _maxDuration =  3;  // in minutes. Applies to recorded videos.
    private _acceptVideoUploadExtensions = ["mp4", "mov", "avi"];
    private _initialized = false;

    /** Valid extensions for an upload. */
    public get validExtensions():string[] {
        return this._acceptVideoUploadExtensions;
    }
    /** Max weight for an upload, in Mbytes*/
    public get maxWeight():number {
        return this._maxWeight;
    }
    /** Max duration for a record, in minutes. */
    public get maxDuration():number {
        return this._maxDuration;
    }

    /** Awaits for loading the video public configuration. */
    public async initialize() {
        if( this._initialized ) {
            return;
        }
        try {
            await conf().Platform.apps.initialize(APP.VIDEO, false);

            conf().Platform.apps.getPublicConf(APP.VIDEO)
            .then( response => {
                this._maxWeight = this.safeValueOf(response, "max-videosize-mbytes", this._maxWeight);
                this._maxDuration = this.safeValueOf(response, "max-videoduration-minutes", this._maxDuration);
                let exts = response["accept-videoupload-extensions"];
                if( exts ) {
                    if( typeof exts==="string" ) {
                        exts = [exts];
                    }
                    this._acceptVideoUploadExtensions = exts || this._acceptVideoUploadExtensions;
                    // Force to upper case
                    this._acceptVideoUploadExtensions = this._acceptVideoUploadExtensions.map( e => e.toUpperCase() );
                }
            });
        } finally {
            this._initialized = true;
        }
    }

    private safeValueOf(obj:any, key:string, defaultValue:number) {
        try { 
            const value = parseInt( obj[key] );
            return typeof value!=="number" || isNaN(value) ? defaultValue : value;
        }
        catch(e) { 
            return defaultValue;
         }
    }

    public checkValidExtension(ext:string) {
        ext = ext.toUpperCase();
        return this._acceptVideoUploadExtensions.findIndex(e => ext===e) !== -1;
    }

    public async upload(file:Blob, filename:string, captation:boolean, duration?:string|number):Promise<IVideoUploadResult> {
        if (!file) {
            throw new Error("Invalid video file.");
        }
        if (!filename) {
            throw new Error("Invalid video filename.");
        }
        
        let uploadUrl = "/video/encode?captation="+captation;

        // Add some metadata for the event layer.
        let formData = VideoEventTrackerService.asFormData();
        formData.append("file", file, filename);
        formData.append("weight", ''+file.size );
        formData.append("captation", ''+captation);
        if( duration ) {
            formData.append("duration", ''+duration);
            uploadUrl += "&duration="+duration;
        }
        
        const uploadRes = await http().post<IVideoUploadResult>(uploadUrl, formData);
        if(http().latestResponse.status==202){
            const checkUrl = '/video/status/'+ (http().latestResponse as UploadResponse).data.processid;
//            console.log("[VideoUploader] start fetching status for :", uploadRes.data.processid, uploadRes.data);
            let previous=0, seconds=1;
            do {
                // Wait then check status
                const waitDuration = seconds+previous;
                await new Promise( resolve => setTimeout(resolve, waitDuration*1000) );
                previous = seconds;
                seconds = Math.min(8, waitDuration); // Fibonacci limited to 8
                const check = await http().get<IVideoUploadResult>(checkUrl);
                if( http().latestResponse.status == 201 ){
                    return check; // finished !
                }
                if( http().latestResponse.status != 202 ) {
                    break;
                }
            } while( true );
        }
        throw new Error("Video cannot be uploaded.");
    }
}
