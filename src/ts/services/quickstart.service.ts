import { ConfigurationFrameworkFactory, IUserInfo, SessionFrameworkFactory, TransportFrameworkFactory } from "ode-ts-client";
import moment from 'moment'; // FIXME : should we use moment anymore ?

const skin = ConfigurationFrameworkFactory.instance().Platform.theme;

const model = {
	get me():IUserInfo { return SessionFrameworkFactory.instance().session.user; }
}

const http = TransportFrameworkFactory.instance().http;

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
	seeAssistantLater(){
 		this.state.assistantTimer = moment().format('MM/DD/YYYY HH:mm');
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
		http.putJson('/userbook/preference/quickstart', this.state).then( () => {
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
		http.get('/userbook/preference/quickstart').then( pref => {
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
 					&& moment(preferences.assistantTimer).year() === moment().year() 
 					&& moment(preferences.assistantTimer).dayOfYear() === moment().dayOfYear() 
 					&& moment(preferences.assistantTimer).hour() === moment().hour()
 				)
 			){
				http.get(skin.basePath + 'template/assistant/steps.json').then( steps => {
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
