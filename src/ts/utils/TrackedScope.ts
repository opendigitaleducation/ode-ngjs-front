import { IScope } from "angular";
import { ActionType } from "ode-ts-client";

/**
 * User actions that components emit as javascript custom events.
 * For example: { 'open': 'news link' } or { 'create':'audio', 'audio':myAudioObject }
 */
export type TrackedAction = {
    [action in ActionType]?: string;
} & {
    [metadata: string]: any;
}

/** 
 * An angularJS scope implementing this interface can track events more easily. 
 * See details in each component documentation.
 */
export interface TrackedScope extends IScope {
	trackEvent: (e:Event, params:CustomEventInit<TrackedAction>) => void;
}
