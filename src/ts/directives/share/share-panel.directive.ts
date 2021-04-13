import * as Explorer from '../explorer/explorer.directive';
import { IAttributes, IController, IDirective, IScope } from "angular";
import { IBehaviours } from "../../legacy/Behaviours";
import { HttpPromisified } from "../../legacy/http";
import { Idiom } from "../../legacy/idiom";
import { Shareable, ShareVisible, SharePayload, ShareInfos, ShareAction } from "../../legacy/rights";
import { UiModel } from "../../models/ui.model";

// FIXME legacy stuff
export const appPrefix: string = (window as any).appPrefix;
export const infraPrefix: string = (window as any).infraPrefix;
declare const notify:{
    message(t:"error"|"info"|"success", message:string, timeout?:number):void;
	error(message:string, timeout?:number):void;
	info(message:string, timeout?:number):void;
	success(message:string, timeout?:number):void;
};
declare const model:{
	me: any;
    calendar: any;
    videoRecorder: any;
    widgets: any;
	mediaLibrary: any;
	bootstrapped: boolean;
};
declare namespace entcore {
    let Behaviours: IBehaviours;
    let idiom:Idiom;
    let ui: any;
    let httpPromisy: <T>(inner?: any) => HttpPromisified<T>;
};


export interface ShareCloseDelegate {
    $canceled: boolean
    $close: () => void
}

export interface ShareableWithId extends Shareable {
    _id: string
}

type tofix = void; //TODO
type InnerShareData = { users:{ visibles:any[] }; groups:{ visibles:any[] } };


export class SharePanelController implements IController {
    //------------------
    //-- Properties
    display: {
        showSaveSharebookmarkInput: boolean,
        sharebookmarkSaved: boolean,
        workflowAllowSharebookmarks: boolean,
        showCloseConfirmation: boolean,
        showBookmarkMembers: boolean,
        search: {
            processing: Boolean
        }
    } = {
        showSaveSharebookmarkInput: false,
        sharebookmarkSaved: false,
        workflowAllowSharebookmarks: false,
        showCloseConfirmation: false,
        showBookmarkMembers: false,
        search: {
            processing: false
        }
    };
    sharing: {
        actions?: ShareAction[]
    } = {};
    varyingRights: boolean|undefined;
    varyingRightsI18nKey: string|undefined;
    editResources: Shareable[] = [];
    sharingModel: ShareInfos & { edited: any[], editedInherited: any[], changed?: boolean, sharebookmarks?: any } = {
        edited: [],
        editedInherited: [],
        changed: false
    } as any; // FIXME ShareInfos default values ?
    appPrefix: string = appPrefix;
    shareTable: string = "";
    resources: Array<ShareableWithId> = [];
    maxResults: number = 5;
    translate?:Function;
    actions: ShareAction[]|undefined;
    search: string = "";
    found: ShareVisible[] = [];
    maxEdit: number = 3;
    shareOverrideDefaultActions: string[]|undefined;
    newSharebookmarkName:string = ""; //FIXME appararait dans le template, mais j'ai dû le déclarer ici car n'existe pas sinon !? voir infra-front.

    //------------------
    //-- Constructor
    constructor( private $scope:IDirectiveScope ) {
        // Remove transpilation warnings due to the "bindToController", which angularjs already checks.
        this.model = null as unknown as UiModel;
    }

    //------------------
    //-- Bound attributes
    model: UiModel;
    autoClose?: boolean;
    onValidate?(args: {
        $data: SharePayload,
        $resource: ShareableWithId,
        $actions: ShareAction[]
    }):tofix;
    canEditDelegate?(args: {
        $item: { type: string, id: string }
    }): boolean;
    confirmationCloseDelegate?(args: ShareCloseDelegate):tofix;
    closeDelegate?(args: ShareCloseDelegate):tofix;
    onCancel?():tofix;
    onSubmit?(args: { $shared: SharePayload }):tofix;
    onFeed?(args: {
        $data: ShareInfos,
        $resource: ShareableWithId,
        $actions: ShareAction[]
    }):tofix;

    //------------------
    //-- Initialization
    /* this.model is null here. */
    $onInit() {
        this.translate = entcore.idiom.translate;
        this.shareTable = require('./share-panel-table.lazy.html').default;

        this.loadDirectoryWorkflow();

        // get sharing configuration from platform
        // if no sharing configuration from platform then get sharing configuration from app behaviours
        entcore.httpPromisy<{overrideDefaultActions:Array<string>}>()
        .get(`${this.appPrefix}/config/share`)
        .then( config => {
            if (config && config.overrideDefaultActions) {
                this.shareOverrideDefaultActions = config.overrideDefaultActions;
            } else {
                this.loadAppBehavioursSharingConf();
            }
        })
        .catch( () => {
            this.loadAppBehavioursSharingConf();
        });
    }
    /* this.model is not null here. */
    $postLink() {
        if( this.model.app ) {
            this.appPrefix = this.model.app;
        }
        // Sanitize the injected "resources" data => adapt it to Array<ShareableWithId>
        this.resources = this.model.selectedItems.map( i => Object.assign({
            _id:i.id, 
            owner:{userId:i.authorId, displayName:i.authorName}, 
            myRights: {},
            shared: {}
        }, i) );
        let tmp = this.resources as Object;
        if (!(tmp instanceof Array || tmp.hasOwnProperty("myRights"))) {
            throw new TypeError('Resources in share panel must be instance of Array or implement Rights interface');
        }
        if (!(tmp instanceof Array)) {
            this.resources = [tmp as ShareableWithId];
        }

        entcore.httpPromisy<any>().get('/' + infraPrefix + '/public/json/sharing-rights.json').then( (config:{}) => {
            this.actionsConfiguration = config;
        });
    }

    //------------------
    //-- Methods
    /** get directory workflow to manage allowSharebookmarks workflow */
    private async loadDirectoryWorkflow() {
        await model.me.workflow.load(['directory']);
        this.display.workflowAllowSharebookmarks = model.me.workflow.directory.allowSharebookmarks;
        this.$scope.$apply();
    }
    
    private loadAppBehavioursSharingConf() {
        entcore.Behaviours.loadBehaviours(this.appPrefix, () => {
            if (entcore.Behaviours.applicationsBehaviours[this.appPrefix] 
                && entcore.Behaviours.applicationsBehaviours[this.appPrefix].share
                && typeof entcore.Behaviours.applicationsBehaviours[this.appPrefix].share === "function") {
                    this.shareOverrideDefaultActions = entcore.Behaviours.applicationsBehaviours[this.appPrefix].share().overrideDefaultActions;
            }
        });
    }

    canEdit(item: { type: string, id: string }): boolean  {
        if (this.canEditDelegate) {
            return this.canEditDelegate({ $item: item });
        }
        return true;
    }

    isSubmitDisabled(): boolean {
        if( ! this.actions ) {
            return true;
        }
        let hasUnchecked = false;
        for (let item of this.sharingModel.edited) {
            let allUnckecked = true;
            for (let a of this.actions) {
                if (item.actions[a.displayName]) {
                    allUnckecked = false;
                }
            }
            if (allUnckecked) {
                hasUnchecked = true;
            }
        }
        const hasNotChanged = !this.sharingModel.changed;
        return hasNotChanged || hasUnchecked;
    }

    createSharebookmark(newSharebookmarkName: string):void {
        if (model.me.workflow.directory.allowSharebookmarks == true) {
            let members:Array<string> = [];
            this.sharingModel.edited.forEach(item => {
                if (item.type == 'user' || item.type == 'group') {
                    members.push(item.id);
                } else { // if it is a sharebookmark
                    if (item.users) {
                        item.users.forEach((user: { id: string; }) => members.push(user.id));
                    }
                    if (item.groups) {
                        item.groups.forEach((group: { id: string; }) => members.push(group.id));
                    }
                }
            })
            let data = {
                "name": newSharebookmarkName,
                "members": members
            };

            entcore.httpPromisy<void>().postJson('/directory/sharebookmark', data).then( () => {
                this.display.sharebookmarkSaved = true;
                this.$scope.$apply();
            });
        }
    }
    typeSort(value: any):number {
        if (value.type == 'sharebookmark') return 0;
        if (value.type == 'group') return 1;
        return 2;
    }
    remove(element: ShareVisible):void {
        this.sharingModel.edited = this.sharingModel.edited.filter( item => {
            return item.id !== element.id;
        });
        this.sharingModel.changed = true;
        this.display.showSaveSharebookmarkInput = false;
        this.display.sharebookmarkSaved = false
    }
    displayMore():void{
        const displayMoreInc = 5;
        this.maxEdit += displayMoreInc;
    }

    private requiredActions(item:{ actions:{ [x: string]:any; }; }, action:ShareAction) {
        if (!item.actions[action.displayName]) {
            this.actions?.filter( i => {
                return (i.requires?.findIndex( (dependency:string) => {
                    return action.displayName.split('.')[1].indexOf(dependency) !== -1;
                }) ?? -1) !== -1;
            })
            .forEach( i => {
                if (i) {
                    item.actions[i.displayName] = false;
                }
            })
        } else {
            action.requires?.forEach( (required:string) => {
                const action = this.actions?.find( action => {
                    return action.displayName.split('.')[1].indexOf(required) !== -1;
                });
                if (action) {
                    item.actions[action.displayName] = true;
                }
            });
        }
    }

    changeAction(
            item: { 
                type:string; 
                users: {
                    actions:{ [x: string]:any; }; 
                }[]; 
                actions: { [x: string]: any; }; 
                groups: {
                    actions: { [x: string]: any; }; 
                }[]; 
                id: any;
                hide: boolean; 
            },
            action: ShareAction):void {
        if (item.type == 'sharebookmark') {
            item.users.forEach((user: { actions: { [x: string]: any; }; }) => {
                user.actions[action.displayName] = item.actions[action.displayName];
                this.requiredActions(user, action);
            });
            item.groups.forEach((group: { actions: { [x: string]: any; }; }) => {
                group.actions[action.displayName] = item.actions[action.displayName];
                this.requiredActions(group, action);
            });
        }
        if (item.type == 'sharebookmark-user' || item.type == 'sharebookmark-group') {
            var element = this.sharingModel.edited.find(edited => edited.id == item.id);
            if (element) {
                element.actions = item.actions;
                element.hide = true;
            } else {
                item.hide = true;
                this.sharingModel.edited.push(item);
            }
        }
        this.requiredActions(item, action);
        this.sharingModel.changed = true;
    }

    private actionToRights(action:string):Array<string> {
        const rights:Array<string> = [];
        this.actions?.filter(a => a.displayName===action).forEach( item => {
            item.name.forEach( name => {
                rights.push(name);
            });
        });
        return rights;
    }

    private rightsToActions(rights:Array<string>):{[key:string]:boolean} {
        var actions:{[key:string]:boolean} = {};
        rights.forEach( right => {
            const action = this.actions?.find( action => {
                return action.name.indexOf(right) !== -1
            });
            if (!action) {
                return;
            }
            if (!actions[action.displayName]) { //FIXME intérêt de ce test avant affectation de true ? Combiner avec le if précédent pour une meilleure lisibilité.
                actions[action.displayName] = true;
            }
        });
        return actions;
    }

    async share() {
        this.sharingModel.changed = false;

        const data: SharePayload = {};
        const users: { [key: string]: string[] } = {};
        const groups: { [key: string]: string[] } = {};
        const sharebookmarks: { [key: string]: string[] } = {};

        this.sharingModel.edited.forEach( item => {
            let rights:Array<string> = [];
            for (let action in item.actions) {
                if (item.actions.hasOwnProperty(action)
                    && item.actions[action] == true) {
                    rights = rights.concat( this.actionToRights(action) );
                }
            }
            if (item.type == 'sharebookmark') {
                sharebookmarks[item.id] = rights;
            } else if (item.type == 'user' || item.type == 'sharebookmark-user') {
                users[item.id] = rights;
            } else {
                groups[item.id] = rights;
            }
        });

        data['users'] = users;
        data['groups'] = groups;
        data['bookmarks'] = sharebookmarks;

        const promises = (this.resources as Array<ShareableWithId>).map( async resource => {
            // if user can share resource => add user to share users array
            if (resource.myRights
                && (resource.myRights['share'] != undefined
                    || resource.myRights['manage'] != undefined
                    || resource.myRights['manager'] != undefined)
                && resource.shared) {
                let rights: string[] = [];
                let myRights = resource.shared.find((sharedItem: { userId: any; }) => sharedItem.userId == model.me.userId);

                if (myRights) {
                    Object.keys(myRights).forEach(key => {
                        if (myRights[key] == true && key != 'userId') {
                            rights.push(key);
                        }
                    });

                    users[model.me.userId] = rights;
                    data['users'] = users;
                }
            }
            if (this.onValidate && typeof this.actions!=="undefined") {
                try {
                    await this.onValidate({ '$data':data, '$resource':resource, '$actions':this.actions })
                } catch (e) {
                    return Promise.reject(e);
                }
            }
            const self = this;
            return entcore.httpPromisy<{ [x: string]: any; }>()
                .putJson('/' + this.appPrefix + '/share/resource/' + resource._id, data)
                .then( res => {
                    self.$scope.$root.$broadcast('share-updated', res['notify-timeline-array']);
                });
        });
        try {
            await Promise.all(promises);
            notify.success('share.notify.success');
        } catch (e) {
            notify.error('share.notify.error');
        }
        if (this.autoClose && this.$scope.closePanel) {
            await this.$scope.closePanel(false);
        }
        this.onSubmit && this.onSubmit({ '$shared': data });
    }

    private usersCache:{[key:string]:any} = {};

    findUserOrGroup():any {
        var searchTerm = entcore.idiom.removeAccents(this.search).toLowerCase();
        var startSearch = model.me.functions.ADMIN_LOCAL ? searchTerm.substr(0, 3) : '';
        if (!this.usersCache[startSearch] && !(this.usersCache[startSearch] && this.usersCache[startSearch].loading)) {
            this.usersCache[startSearch] = { loading: true };
            var id = this.resources[0]._id;
            var path = '/' + this.appPrefix + '/share/json/' + id + '?search=' + startSearch;
            if (!startSearch) {
                path = '/' + this.appPrefix + '/share/json/' + id;
            }
            entcore.httpPromisy<InnerShareData>().get(path).then( (data:InnerShareData) => {
                data.users.visibles.map((user: { type: string; }) => user.type = 'user');
                data.groups.visibles.map((group: { type: string; }) => group.type = 'group');

                this.usersCache[startSearch] = { groups: data.groups, users: data.users };
                this.sharingModel.groups = this.usersCache[startSearch].groups;
                this.sharingModel.users = this.usersCache[startSearch].users;

                if (model.me.workflow.directory.allowSharebookmarks == true) {
                    entcore.httpPromisy().get('/directory/sharebookmark/all').then( (data:any) => {
                        var bookmarks = data.map( (bookmark:{ type:string; }) => {
                            bookmark.type = 'sharebookmark';
                            return bookmark;
                        });
                        this.usersCache[startSearch]['sharebookmarks'] = bookmarks;

                        this.findUserOrGroup();
                        this.$scope.$apply();
                    });
                } else {
                    this.findUserOrGroup();
                    this.$scope.$apply();
                }
            });
            return;
        }
        this.sharingModel.groups = this.usersCache[startSearch].groups;
        this.sharingModel.users = this.usersCache[startSearch].users;
        this.sharingModel.sharebookmarks = this.usersCache[startSearch].sharebookmarks;

        const array1 = this.sharingModel.sharebookmarks?.filter( (bookmark: { name: any; id: any; }) => {
            var testName = entcore.idiom.removeAccents(bookmark.name).toLowerCase();
            return testName.indexOf(searchTerm) !== -1 && this.sharingModel.edited.find((i: { id: any; }) => i.id === bookmark.id) === undefined;
        }) ?? [];
        const array2 = this.sharingModel.groups?.visibles?.filter( (group: { name: any; id: any; }) => {
            var testName = entcore.idiom.removeAccents(group.name).toLowerCase();
            return testName.indexOf(searchTerm) !== -1 && this.sharingModel.edited.find((i: { id: any; }) => i.id === group.id) === undefined;
        }) ?? [];
        const array3 = this.sharingModel.users?.visibles?.filter( (user:any) => { //FIXME any hack
            var testName = entcore.idiom.removeAccents(user.lastName + ' ' + user.firstName).toLowerCase();
            var testNameReversed = entcore.idiom.removeAccents(user.firstName + ' ' + user.lastName).toLowerCase();
            var testUsername = entcore.idiom.removeAccents(user.username).toLowerCase();
            return (testName.indexOf(searchTerm) !== -1 || testNameReversed.indexOf(searchTerm) !== -1) || testUsername.indexOf(searchTerm) !== -1 && this.sharingModel.edited.find((i: { id: any; }) => i.id === user.id) === undefined;
        }) ?? [];
        // Concatene arrays and remove duplicates within it.
        this.found = [...array1, ...array2, ...array3].filter( (thing, index, self) =>
            index === self.findIndex( t => t===thing )
        );
        this.found = this.found.filter( (element: { id: any; }) => {
            return this.sharingModel.edited.findIndex((i: { id: any; }) => i.id === element.id) === -1;
        });

        this.display.search.processing = false;
        this.$scope.$apply();
    }

    addResults():void {
        this.maxResults += 5;
    }

    // config cache
    private actionsConfiguration:{[key:string]:any} = {};

    addEdit(item: ShareVisible):void {
        let augmentedItem:any = item;   // FIXME data hack
        item.actions = {};
        this.sharingModel.edited.push(item);
        augmentedItem.index = this.sharingModel.edited.length;
        var addedIndex = this.found.indexOf(item);
        this.found.splice(addedIndex, 1);

        let defaultActions:Array<any> = [];
        this.actions?.forEach( action => {
            var actionId = action.displayName.split('.')[1];

            if (this.shareOverrideDefaultActions) {
                this.shareOverrideDefaultActions.forEach(shareOverrideDefaultAction => item.actions[shareOverrideDefaultAction] = true);
                defaultActions = this.shareOverrideDefaultActions;
            } else if (this.actionsConfiguration[actionId].default) {
                item.actions[action.displayName] = true;
                defaultActions.push(action);
            }
        });

        if (augmentedItem.type == 'sharebookmark') {
            entcore.httpPromisy<{users:any; groups:any;}>().get('/directory/sharebookmark/' + item.id).then( (data:{users:any; groups:any;}) => {
                augmentedItem.users = data.users;
                augmentedItem.groups = data.groups;
                if (augmentedItem.users) {
                    augmentedItem.users.forEach((user: { type: string; actions: { [x: string]: boolean; }; }) => {
                        user.type = 'sharebookmark-user';
                        user.actions = {};
                        defaultActions.forEach(defaultAction => {
                            user.actions[defaultAction] = true;
                        });
                    });
                }

                if (augmentedItem.groups) {
                    augmentedItem.groups.forEach((group: { type: string; actions: { [x: string]: boolean; }; }) => {
                        group.type = 'sharebookmark-group';
                        group.actions = {};
                        defaultActions.forEach(defaultAction => {
                            group.actions[defaultAction] = true;
                        });
                    });
                }
                this.$scope.$apply();
            });
        }

        this.sharingModel.changed = true;
        this.display.showSaveSharebookmarkInput = false;
        this.display.sharebookmarkSaved = false
    }

    setActions( actions:Array<ShareAction> ) {
        this.actions = actions;
        this.actions.forEach( (action:ShareAction) => {
            var actionId = action.displayName.split('.')[1];
            if (this.actionsConfiguration[actionId]) {
                action.priority = this.actionsConfiguration[actionId].priority;
                action.requires = this.actionsConfiguration[actionId].requires;
            }
        });
    }

    clearSearch():void {
        this.sharingModel.groups = [] as any;
        this.sharingModel.users = [] as any;
        this.found = [];
    }

    canShowMore(): boolean {
        let count = 0;
        if (this.sharingModel.edited && this.sharingModel.edited.length) {
            count += this.sharingModel.edited.length;
        }
        if (this.sharingModel.editedInherited && this.sharingModel.editedInherited.length) {
            count += this.sharingModel.editedInherited.length;
        }
        return count > this.maxEdit;
    }

    getColor(profile?:string|Array<string>): string|undefined {
        return entcore.ui.profileColors.match(profile);
    }

    private differentRights(model1:any, model2:any) { // FIXME any hack
        var result = false;
        function different(type: string) {
            for (var element in model1[type].checked) {
                if (!model2[type].checked[element]) {
                    return true;
                }
                model1[type].checked[element].forEach(function (right: any) {
                    result = result || model2[type].checked[element].indexOf(right) === -1
                });
            }
            return result;
        }
        return different('users') || different('groups');
    }

    private onFeedEvent(data:ShareInfos, resource: ShareableWithId, actions: ShareAction[]) {
        if (this.onFeed) {
            this.onFeed({ '$data':data, '$resource': resource, '$actions': actions });
        }
    }

    private feeding = false;
    feedData() {
        if (this.feeding) {
            return;
        }
        this.feeding = true;
        let initModel = true;
        if (this.resources?.length === 0) {
            this.feeding = false;
        }
        this.resources.forEach( resource => {
            var id = resource._id;
            entcore.httpPromisy<ShareInfos>().get('/' + this.appPrefix + '/share/json/' + id + '?search=').then( (data:ShareInfos) => {
                this.onFeedEvent(data, resource, data.actions);
                if (initModel) {
                    data.users.visibles.map((user:any) => user.type = 'user');
                    data.groups.visibles.map((group:any) => group.type = 'group');

                    this.sharingModel = data as any; //FIXME data hack
                    this.sharingModel.edited = [];//FIXME data hack
                    this.sharingModel.editedInherited = [];//FIXME data hack
                }

                (data as any)._id = resource._id;//FIXME data hack
                this.editResources.push(data as unknown as Shareable);//FIXME data hack

                const editResource:any = this.editResources[this.editResources.length - 1];//FIXME any hack
                if (!this.sharing.actions) {
                    this.setActions(data.actions);
                }

                const addToEdit = (type: 'groups'|'users') => {
                    for (let element in editResource[type].checked) {
                        const rights = editResource[type].checked[element];

                        const groupActions = this.rightsToActions(rights);
                        const elementObjOriginal = (editResource[type].visibles as Array<ShareVisible>).find( i => i.id===element );
                        if (elementObjOriginal) {
                            const elementObj = { ...elementObjOriginal };
                            elementObj.actions = groupActions;
                            if (initModel) {
                                this.sharingModel.edited.push(elementObj);
                            }

                            (elementObj as any).index = this.sharingModel.edited.length;
                        }
                    }
                    //inherit checked //TODO factoriser avec le bloc de code ci-dessus
                    if (editResource[type].checkedInherited) {
                        const checkedInherited = editResource[type].checkedInherited;
                        for (let element in checkedInherited) {
                            const rights = checkedInherited[element];

                            const groupActions = this.rightsToActions(rights);
                            const elementObjOriginal = (editResource[type].visibles as Array<ShareVisible>).find( i => i.id===element);
                            if (elementObjOriginal) {
                                const elementObj = { ...elementObjOriginal };
                                elementObj.actions = groupActions;
                                if (initModel) {
                                    this.sharingModel.editedInherited.push(elementObj);
                                }
                                (elementObj as any).index = this.sharingModel.editedInherited.length; //FIXME data hack
                            }
                        }
                    }
                }

                addToEdit('groups');
                addToEdit('users');

                if (!initModel) {
                    if (this.differentRights(editResource, this.sharingModel) || this.differentRights(this.sharingModel, editResource)) {
                        this.varyingRights = true;
                        this.sharingModel.edited = [];
                        this.varyingRightsI18nKey =
                            entcore.idiom.translate(`${this.appPrefix}.share.varyingrights`) === `${this.appPrefix}.share.varyingrights`
                            ? "share.varyingrights"
                            : `${this.appPrefix}.share.varyingrights`
                    }
                }
                initModel = false;

                this.$scope.$apply('sharingModel.edited');
                this.feeding = false;
            });
        })
    };


}

//-----------------------------------------------
//----------------- Directive -------------------
//-----------------------------------------------
interface IDirectiveScope extends IScope {
    closePanel?(cancelled:boolean):Promise<void>;
    revertClose?():void;
}
class Directive implements IDirective<IDirectiveScope,JQLite,IAttributes,IController[]> {
    restrict= 'E';
    templateUrl= require('./share-panel.directive.lazy.html').default;
    scope= {
        onCancel: '&?',
        onSubmit: '&?',
        onValidate: '&?',
        onFeed: '&?',
        closeDelegate: '&?',
        confirmationCloseDelegate: '&?',
        canEditDelegate: '&?',
        autoClose: '='
    };
	bindToController = true;
	controller = ["$scope", SharePanelController];
	controllerAs = 'ctrl';
	require = ["odeSharePanel", "^^odeExplorer"];

    link(scope:IDirectiveScope, element:JQLite, attrs:IAttributes, controllers:IController[]|undefined): void {
		if( !controllers ) return;
        const ctrl:SharePanelController = controllers[0] as SharePanelController;
        const odeExplorer:Explorer.Controller = controllers[1] as Explorer.Controller;
        ctrl.model = odeExplorer.model;

        scope.$watch('resources', function () {
            ctrl.actions = [];
            ctrl.sharingModel.edited = [];
            ctrl.search = '';
            ctrl.found = [];
            ctrl.varyingRights = false;
            ctrl.sharingModel.changed = false;
            ctrl.display.showSaveSharebookmarkInput = false;
            ctrl.display.sharebookmarkSaved = false;
            ctrl.maxEdit = 3;
            ctrl.maxResults = 5;
            ctrl.feedData();
        });

        scope.$watchCollection('resources', function () {
            ctrl.actions = [];
            ctrl.sharingModel.edited = [];
            ctrl.search = '';
            ctrl.found = [];
            ctrl.varyingRights = false;
            ctrl.sharingModel.changed = false;
            ctrl.display.showSaveSharebookmarkInput = false;
            ctrl.display.sharebookmarkSaved = false;
            ctrl.maxEdit = 3;
            ctrl.maxResults = 5;
            ctrl.feedData();
        });

        const doClose = async () => {
            /* TODO Gérer la fermeture de la modal, sans jquery
            element.closest('.lightbox').first().fadeOut();
            $('body').css({ overflow: 'auto' });
            $('body').removeClass('lightbox-opened');
            element.closest('.lightbox').find('.content > .close-lightbox').css({ visibility: 'visible' });

            const isolatedScope = element.closest('lightbox').isolateScope();
            if (isolatedScope) {
                isolatedScope.$eval(isolatedScope.onClose);
                isolatedScope.show = false;
                isolatedScope.$parent.$apply();
            }
            */
            ctrl.display.showCloseConfirmation = false;
            await ctrl.feedData();

            scope.$apply();
        }

        scope.closePanel = async (cancelled:boolean = true) => {
            if (ctrl.closeDelegate) {
                ctrl.closeDelegate({ "$canceled": cancelled, "$close": doClose })
            } else {
                await doClose()
            }
            if (cancelled) {
                ctrl.onCancel && ctrl.onCancel();
            }
        }
        
        scope.revertClose = () => {
            /* TODO Gérer la fermeture de la modal, sans jquery
            element.closest('.lightbox').find('.content > .close-lightbox').css({ visibility: 'visible' });
            */
            ctrl.display.showCloseConfirmation = false;
            scope.$apply();
        }
    
        const closeCallback = function (e: { stopPropagation: () => void; }) {
            e.stopPropagation();
            if (!ctrl.sharingModel.changed && scope.closePanel)
                scope.closePanel(true);
            else if (!ctrl.display.showCloseConfirmation) {
                if (ctrl.confirmationCloseDelegate) {
                    ctrl.confirmationCloseDelegate({ "$canceled": true, "$close": doClose })
                    return;
                }
                ctrl.display.showCloseConfirmation = true;
                /* TODO Gérer la fermeture de la modal, sans jquery
                element.closest('.lightbox').find('.content > .close-lightbox').css({ visibility: 'hidden' });
                */
                scope.$apply(); // FIXME ce $apply() parait redondant avec celui ci-dessous.
            }
            scope.$apply();
        };

        /* TODO Gérer la fermeture de la modal, sans jquery
        element.closest('.lightbox').find('.background, .content > .close-lightbox').on('click', closeCallback);
        //unbind event
        scope.$on("$destroy", function () {
            element.closest('.lightbox').find('.background, .content > .close-lightbox').off('click', closeCallback)
        });
        */
    }
}

/** The share-panel directive.
 *
 * Usage:
 *      
 */
 export function DirectiveFactory() {
	return new Directive();
}
