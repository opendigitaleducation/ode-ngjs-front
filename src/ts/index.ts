/** Samples are grouped within a submodule ("as Samples"), for clarity. */
export * as Samples from './samples/index';

/* Other directives are exported directly, for simplicity. */
export * from './directives/index';

export * from './services/index';

export * from './modules/index';

export * from './utils/index';

/** Hack pour rendre compatible le module commonjs avec une balise <script> dans un navigateur. */
declare var window:any;
declare var module:any;
if(typeof window!=='undefined') {
    window.entcore = window.entcore||{};
    window.entcore["ode-ngjs-front"] = module.exports;
}
