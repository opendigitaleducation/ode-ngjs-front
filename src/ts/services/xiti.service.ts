import { ConfigurationFrameworkFactory, IXitiTrackingParams } from "ode-ts-client";

/** The xiti loader service. */
export class XitiService {

    /** Apply XiTi tracking. */
    public runScript() {
        ConfigurationFrameworkFactory.instance().Platform.analytics.xiti()
        .then( conf => {if(conf) this.loadScript(conf); });
    }

    //Final action - populates xiti vars & launches the script
    private loadScript( xitiConf:IXitiTrackingParams ) {
        //console.log(conf)

        if( typeof xitiConf.ID_ETAB === 'object' ) {
            //Xiti script path
            const skin = ConfigurationFrameworkFactory.instance().Platform.theme;
            const scriptPath = skin.basePath + 'js/xtfirst_ENT.js';

            (window as any).xt_multc = "&x1=" + xitiConf.ID_SERVICE +
                "&x2=" + xitiConf.ID_PROFIL +
                "&x3=" + xitiConf.ID_PROJET +
                "&x4=" + xitiConf.ID_PLATEFORME;

            (window as any).xt_at = xitiConf.ID_PERSO;
            (window as any).xtidc = xitiConf.ID_PERSO;
            (window as any).xt_ac = xitiConf.ID_PROFIL;

            (window as any).xtparam = (window as any).xt_multc + "&ac="+ (window as any).xt_ac  +"&at=" + (window as any).xt_at;

            (window as any).xtnv = document;

            if( xitiConf.ENABLE_PROXY ){
                (window as any).xtsdi = window.location.protocol + "//" + window.location.host + "/hit.xitif"
            }
            (window as any).xtsd = window.location.protocol === "https:" ? "https://logs" : "http://logi7";
            (window as any).xtsite = xitiConf.ID_ETAB.collectiviteId;
            (window as any).xtn2 = xitiConf.ID_ETAB.id;
            (window as any).xtpage = xitiConf.LIB_SERVICE;
            (window as any).xtdi = "";

            jQuery.getScript(scriptPath, function(){ console.log("xiti ready"); });
        }
    }
}
