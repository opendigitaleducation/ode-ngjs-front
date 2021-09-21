import moment from "moment"; // FIXME : should we use moment anymore ?

export abstract class L10n {
    /** 
     * Initialize Moment's locale with given language. 
     * @see https://momentjs.com/docs/#/i18n/
     */ 
    static initialize( lang:string ) {
        const localesToUpdate = {
            "fr": {
                calendar: {
                    lastDay: '[Hier à] HH[h]mm',
                    sameDay: '[Aujourd\'hui à] HH[h]mm',
                    nextDay: 'dddd D MMMM YYYY',
                    lastWeek: 'dddd D MMMM YYYY',
                    nextWeek: 'dddd D MMMM YYYY',
                    sameElse: 'dddd D MMMM YYYY'
                }
            }
        };
        moment.locale( lang );
        if( lang in localesToUpdate ) {
            moment.updateLocale( lang, (localesToUpdate as any)[lang] );
        }
    }

    static moment(inp?: moment.MomentInput, param2?: boolean|moment.MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment {
        if( typeof param2!=="boolean" || language || typeof strict==="boolean" ) {
            return moment(inp, param2 as moment.MomentFormatSpecification, language, strict);
        } else {
            return moment(inp, strict);
        }
    }

    static utc(inp?: moment.MomentInput, strict?: boolean | undefined):moment.Moment {
        return moment.utc(inp);
    }

    static unix(timestamp: number): moment.Moment {
        return moment.unix( timestamp );
    }
}
