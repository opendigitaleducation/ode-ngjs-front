import angular, { IAttributes, IController, IDirective, IScope } from "angular";
import { ManualChangeListener, navigationGuardService } from "../../../utils/navigation-guard";

export interface INavigationTriggerParam {
    onEvent?:string|Array<string>;
    rootGuardId?:string;
    guardMessageKey?:string;
};

/* Directive */
class Directive implements IDirective<IScope,JQLite,IAttributes,IController[]> {
    restrict = "A";
    link(scope:IScope, element:JQLite, attrs:IAttributes, controllers?:IController[]): void {
        const params:INavigationTriggerParam =  scope.$eval(attrs['navigationTriggerParam'] || "{onEvent:'click'}");
        params.rootGuardId = params.rootGuardId || '*';
        const listener = new ManualChangeListener();
        navigationGuardService.registerListener(listener);
        let unbinds:Array<Function> = [];
        const trigger = (e: Event) => {
            e && e.preventDefault();
            listener.onChange.next({
                checkGuardId: params.rootGuardId, // Can be null or undefined
                confirmMessageKey: params.guardMessageKey, // Defaults to 'navigation.guard.text' when null or undefined, see navigationGuardService
                accept() {
                    scope.$eval(attrs.navigationTrigger)
                },
                reject() { }
            })
        }

        const bind = (element:any, eventName:string, listener:Function):void => {
            element.on(eventName, listener);
            unbinds.push( () => element.off(eventName, listener) );
        }

        const unbindAll = ():void => {
            for( let off of unbinds ) {
                off();
            }
            unbinds = [];
        }

        if( angular.isString(params.onEvent) ) {
            bind( element, params.onEvent as string, trigger );
        } else if( angular.isArray(params.onEvent) ) {
            (params.onEvent as Array<string>).forEach( (n, idx, arr) => {
                // listen to distinct event only once.
                if( angular.isString(n) && arr.lastIndexOf(n)===idx ) {
                    bind( element, n, trigger );
                }
            });
        }
        scope.$on("$destroy", () => {
            unbindAll();
            navigationGuardService.unregisterListener(listener);
        });
    }
};

/**
 * Usage:
 * 
 * &lt;div  navigation-trigger="doSomethingUsefulWhenNavigationConfirmed()" 
 * 
 *   navigation-trigger-param="{onEvent:['click','focus'], confirmMessageKey:'my.msg.key', rootGuardId:'myGuardId'}"&gt;
 * 
 * &lt;/div&gt; 
 * 
 * @param navigation-trigger-param [optional]
 * @values onEvent to specify one or more event that effectively trigger the guard,
 * Set confirmMessageKey to set a i18n for the confirm dialog message,
 * Set rootGuardId to trigger only the guard with specified the ID (useful when nesting guards).
 */
export function DirectiveFactory() {
	return new Directive();
}
