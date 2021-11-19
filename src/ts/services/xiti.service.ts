import { IXitiTrackingParams } from "ode-ts-client";
import { conf, http } from "../utils";

// 2021 implementation of XiTi
declare var ATInternet: any;

/** The xiti loader service. */
export class XitiService {

    /** Apply XiTi tracking. */
    public runScript() {
        conf().Platform.analytics.xiti()
        .then( conf => {
            if(!conf) return;
            console.debug("XiTi conf="+JSON.stringify(conf));
            (async () => await this.loadScript(conf))();
        });
    }

    private async loadScript( xitiConf:IXitiTrackingParams, locationPath:string=window.location.pathname ) {
        // 2021 implementation of XiTi
        const scriptPath = '/xiti/public/js/lib/smarttag_ENT.js';
        const response = await http().get<string>(scriptPath, {headers:{'Accept':'application/javascript'}});
        if (http().latestResponse.status != 200) return;
        eval(response);

		// SERVICE
        let SERVICE = xitiConf.LIBELLE_SERVICE.default || null;
		for(let prop in xitiConf.LIBELLE_SERVICE){
			if(prop !== 'default' && locationPath.indexOf(prop) >= 0){
				SERVICE = xitiConf.LIBELLE_SERVICE[prop];
				break;
			}
		}
        // NOM_PAGE
        // FIXME Adapted from legacy infra-front "appPrefix". I fear side-effects if logic is changed here...
        const appPrefix = (path => {
            if(path && path.split('/').length > 0){
                let locationPath = window.location.pathname.split('/')[1];
                if (locationPath == 'userbook') locationPath = 'directory';
                if (locationPath == 'welcome') locationPath = '.';
                return locationPath;
            }
        })(locationPath);

        let ATTag = new ATInternet.Tracker.Tag({site: xitiConf.STRUCT_ID});
    
        ATTag.setProps({
            "SERVICE": SERVICE,
            "TYPE": xitiConf.TYPE,
            "OUTIL": xitiConf.OUTIL,
            "UAI": xitiConf.STRUCT_UAI,
            "PROJET": xitiConf.PROJET,
            "EXPLOITANT": xitiConf.EXPLOITANT,
            "PLATEFORME": xitiConf.PLATFORME,
            "PROFIL": xitiConf.PROFILE,
        }, true);
    
        ATTag.identifiedVisitor.set({
            id: xitiConf.ID_PERSO,
            category: xitiConf.PROFILE
        });
    
        ATTag.page.set({
            name: (appPrefix==='userbook') ? 'directory' : appPrefix,
            chapter1: '',
            chapter2: '',
            chapter3: '',
            level2: xitiConf.STRUCT_UAI,
        });
    
        ATTag.dispatch();        
    
        /* ------
           FIXME Remove old code in comments below, once the 2021 XiTi impl is validated.
           The following was ported from themes but NEVER TESTED.
        --------- */
        //Final action - populates xiti vars & launches the script
        // if( typeof xitiConf.ID_ETAB === 'object' ) {
        //     //Xiti script path
        //     const skin = conf().Platform.theme;
        //     const scriptPath = skin.basePath + 'js/xtfirst_ENT.js';

        //     (window as any).xt_multc = "&x1=" + xitiConf.ID_SERVICE +
        //         "&x2=" + xitiConf.ID_PROFIL +
        //         "&x3=" + xitiConf.ID_PROJET +
        //         "&x4=" + xitiConf.ID_PLATEFORME;

        //     (window as any).xt_at = xitiConf.ID_PERSO;
        //     (window as any).xtidc = xitiConf.ID_PERSO;
        //     (window as any).xt_ac = xitiConf.ID_PROFIL;

        //     (window as any).xtparam = (window as any).xt_multc + "&ac="+ (window as any).xt_ac  +"&at=" + (window as any).xt_at;

        //     (window as any).xtnv = document;

        //     if( xitiConf.ENABLE_PROXY ){
        //         (window as any).xtsdi = window.location.protocol + "//" + window.location.host + "/hit.xitif"
        //     }
        //     (window as any).xtsd = window.location.protocol === "https:" ? "https://logs" : "http://logi7";
        //     (window as any).xtsite = xitiConf.ID_ETAB.collectiviteId;
        //     (window as any).xtn2 = xitiConf.ID_ETAB.id;
        //     (window as any).xtpage = xitiConf.LIB_SERVICE;
        //     (window as any).xtdi = "";

        //     jQuery.getScript(scriptPath, function(){ console.log("xiti ready"); });
        // }
    }
}
