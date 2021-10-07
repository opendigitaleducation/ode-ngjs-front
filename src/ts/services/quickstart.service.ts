import { IUserInfo } from "ode-ts-client";
import { L10n, conf, session, http } from "../utils";

const skin = conf().Platform.theme;

const model = {
	get me():IUserInfo { return session().user; }
}

/**
 * Service dedicated to the &lt;assistant> directive
 */
export class QuickstartService {
	app: string = "";
	steps:{[s:string]:number} = {};
	state = {} as any;
	types = {
		ENSEIGNANT: 'teacher',
		ELEVE: 'student',
		PERSEDUCNAT: 'personnel',
		PERSRELELEVE: 'relative',
		SUPERADMIN: ''	// Never used, just here to prevent compilation errors.
	};
	mySteps:Array<{index:number, path:string}> = [];
	assistantIndex:any = {};
	assistantStep(index:number){
		return skin.basePath + 'template/assistant/' + this.types[model.me.type] + '/' + index + '.html';
	};
	nextAssistantStep(){
		this.state.assistant ++;
		if(this.state.assistant === this.steps[this.types[model.me.type]]){
			this.state.assistant = -1;
			this.assistantIndex = undefined;
		}
		else{
			this.assistantIndex = this.mySteps[this.state.assistant];
		}

		this.save();
	};
	get assistantTimerFormat() {
		return 'MM/DD/YYYY HH:mm';
	}
	seeAssistantLater(){
 		this.state.assistantTimer = L10n.moment().format(this.assistantTimerFormat);
 		this.save();
 	};
	getAppStep():number {
		return this.state[skin.skin][this.app];
	}
	goToAppStep(index:number){
		this.state[skin.skin][this.app] = index;
		this.save();
		return index;
	};
	nextAppStep(){
		return this.goToAppStep( this.getAppStep() + 1 );
	};
	previousAppStep(){
		return this.goToAppStep( this.getAppStep() - 1 );
	};
	closeApp(){
		this.goToAppStep(-1);
	};
	appIndex(){
		this.app = window.location.href.split('//')[1].split('/').slice(1).join('/');
		if(!this.state[skin.skin]){
			this.state[skin.skin] = {};
		}
		if(!this.state[skin.skin][this.app]){
			this.state[skin.skin][this.app] = 0;
		}
		return this.state[skin.skin][this.app];
	};
	previousAssistantStep(){
		this.state.assistant --;
		if(this.state.assistant < 0){
			this.state.assistant = 0;
		}
		this.assistantIndex = this.mySteps[this.state.assistant];
		this.save();
	};
	save(cb?: () => void){
		http().putJson('/userbook/preference/quickstart', this.state).then( () => {
			if(typeof cb === 'function'){
				cb();
			}
		});
	};
	goTo(index:number){
		if(index > this.mySteps.length){
			index = -1;
		}
		this.state.assistant = index;
		if(index !== -1){
			this.assistantIndex = this.mySteps[index];
		}

		this.save();
	};

	loaded = false;
	loading = false;
	awaiters:Array<() => void> = [];
	load(cb?: () => void){
		if(this.loaded){
			if(typeof cb === 'function'){
				cb();
			}
			return;
		}

		if( cb ) {
			this.awaiters.push(cb);
		}
		if(this.loading){
			return;
		}
		this.loading = true;
		http().get('/userbook/preference/quickstart').then( pref => {
			let preferences;
			if(pref.preference){
				try{
					preferences = JSON.parse(pref.preference);
				}
				catch(e){
					console.log('Error parsing quickstart preferences');
				}
			}
			if(!preferences){
				preferences = {};
			}

			if(!preferences.assistant){
				preferences.assistant = 0;
			}
			if(!preferences[skin.skin]){
				preferences[skin.skin] = {};
			}

			this.state = preferences;

			if(
 				preferences.assistant !== -1 && !(
 					preferences.assistantTimer 
 					&& L10n.moment(preferences.assistantTimer, this.assistantTimerFormat).year() === L10n.moment().year() 
 					&& L10n.moment(preferences.assistantTimer, this.assistantTimerFormat).dayOfYear() === L10n.moment().dayOfYear() 
 					&& L10n.moment(preferences.assistantTimer, this.assistantTimerFormat).hour() === L10n.moment().hour()
 				)
 			){
				http().get(skin.basePath + 'template/assistant/steps.json').then( steps => {
					this.steps = steps;
					let nbSteps = this.steps[this.types[model.me.type]];
					for(let i = 0; i < nbSteps; i++){
						this.mySteps.push({
							index: i,
							path: this.assistantStep(i)
						});
						this.assistantIndex = this.mySteps[this.state.assistant];
					}
					this.loaded = true;
					this.awaiters.forEach(function(cb){
						if(typeof cb === 'function'){
							cb();
						}
					});
				});
			}
			else{
				this.loaded = true;
				this.awaiters.forEach(function(cb){
					if(typeof cb === 'function'){
						cb();
					}
				});
			}
		});
	}    
}
