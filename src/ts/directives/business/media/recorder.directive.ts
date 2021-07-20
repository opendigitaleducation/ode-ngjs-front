import { IAttributes, IController, IDirective, IScope } from "angular";
import { audio_recorder } from "../../../utils/audio-recorder";

interface IAnyRecorder {
    isCompatible():boolean;
    title:string;
    status:string;
    elapsedTime:number;
    state(callback:Function):void;
    pause():void;
    play():void;
    suspend():void;
    record():void;
    flush():void;
    save():void;
}

type RecorderType = "audio" | "video";

/* Controller for the directive */
export class Controller implements IController {
    _recorder:IAnyRecorder = audio_recorder;    // Defaults to audio recorder

    setRecorder( type:RecorderType ) {
        if( type==="audio" ) {
            this._recorder = audio_recorder;
        // } else {
        //     this._recorder = video_recorder;
        }
    }

    get recorder():IAnyRecorder {
        return this._recorder;
    }

    get isAudioCompatible()      { return audio_recorder.isCompatible() /* && video_recorder.isCompatible()*/; }
    get isVideoCompatible()      { return /* video_recorder.isCompatible()*/ false; }

    get isIdle()            { return !this.recorder || this.recorder.status === 'idle'; }
    get isPreparing()       { return this.recorder.status === 'preparing'; }
    get isRecording()       { return this.recorder.status === 'recording'; }
    get isSuspended()       { return this.recorder.status === 'suspended'; }
    get isPaused()          { return this.recorder.status === 'paused'; }
    get isPlaying()         { return this.recorder.status === 'playing'; }
    get isStopped()         { return this.recorder.status === 'stop'; }
    get isEncoding()        { return this.recorder.status === 'encoding'; }
    get isUploading()       { return this.recorder.status === 'uploading'; }

    get showActionButtons() { return this.recorder && this.recorder.elapsedTime > 0 && !this.isStopped; }

    get isAudio():boolean {
        return this._recorder === audio_recorder;
    }
    get isVideo():boolean {
        return false;
    }

    switchAudioRecord() {
        if( !this.recorder ) {
            this.setRecorder( "audio" );
        }
        if( this.isRecording ) {
            this.recorder?.suspend();
        } else {
            this.recorder?.record();
        }
    }

    private pad2(val:number):string {
        return ((val < 10) ? '0':'') + val;
    }

    time() {
        if( !this.recorder ) return "";
        let minutes = parseInt(''+(this.recorder.elapsedTime / 60));
        let seconds = parseInt(''+(this.recorder.elapsedTime % 60));
        return this.pad2(minutes) + ':' + this.pad2(seconds);
    }

    switchPlay() {
        if( this.recorder ) {
            if( this.isPlaying ) {
                this.recorder.pause();
            } else {
                this.recorder.play();
            }
        }
    }

    saveRecord() {
        this.recorder?.save();
    };

    redo() {
        this.recorder?.flush();
        this.recorder?.record();
    }
}

interface Scope extends IScope {
    format:string;
    onUpload:Function;
}

/* Directive */
class Directive implements IDirective<Scope,JQLite,IAttributes,IController[]> {
    restrict = 'EA';
	template = require("./recorder.directive.html").default;
    scope = {
        format: '@',
        onUpload: '&'
    };
	controller = [Controller];
	controllerAs = 'ctrl';
	require = ['odeRecorder'];

    /**
     * Link method for the directive.
     * @see https://code.angularjs.org/1.7.9/docs/api/ng/service/$compile
     * @param $scope scope
     * @param $elem jqLite-wrapped element that this directive matches.
     * @param $attr hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
     * @param controllers Array of "require"d controllers : [ngModelCtrl]
     */
    link(scope:Scope, elem:JQLite, attr:IAttributes, controllers:IController[]|undefined): void {
        let ctrl:Controller|null = controllers ? controllers[0] as Controller : null;
        if( !ctrl || ! ctrl.recorder ) {
            return;
        }

        ctrl.recorder.state( function (eventName:string) {
            if(eventName === 'saved'){
                scope.onUpload();
            }
            if( ctrl?.isRecording ) {
                scope.$apply(); // Force reevaluation of the recorder's field
            }
        });



    }
}

/**
 * The ode-recorder directive.
 *
 * Usage:
 *   &lt;ode-recorder ></ode-recorder&gt;
 */
export function DirectiveFactory() {
	return new Directive();
}
