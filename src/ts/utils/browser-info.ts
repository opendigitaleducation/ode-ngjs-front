import { UAParser } from 'ua-parser-js';

export type BrowserInfo = {
    name:'MSIE'|'Edge'|'Chrome'|'Safari'|'Firefox'|'Opera'|'CriOS'|'FxiOS'|'unknown',
    version:number,
}
export type OSInfo = {
    name: string | undefined;
    version: string | undefined;
}
export const devices = {
    /* A few User Agent strings for testing purposes: 
    * iPod / iPad / iPhone
        Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1
        Mozilla/5.0 (iPad; CPU OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1
        Mozilla/5.0 (iPad; CPU OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1
    */
    getOSInfo: (uaString?: string): OSInfo => {
        let uaParser: UAParser = new UAParser(uaString);
        return uaParser.getOS();
    },
    isIE: () => navigator.userAgent.indexOf('Trident') !== -1,
    isiOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    isIphone: () => navigator.userAgent.indexOf("iPhone") != -1,
    isIpod: () => navigator.userAgent.indexOf("iPod") != -1 ,
    isIpad: () =>navigator.userAgent.indexOf("iPad") != -1 ,
    getBrowserInfo ():BrowserInfo {
        const safeSplit = (str: string = "", pattern: string = "") => {
            if (typeof str == "string") {
                return str.split(pattern);
            } else {
                return [];
            }
        }
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('OPR') !== -1) {
			const operaVersion = safeSplit(userAgent, 'OPR/')[1];
			const version = parseInt(safeSplit(operaVersion, '.')[0]);
			return {
				name: 'Opera',
				version: version,
			}
        } else if (userAgent.indexOf('Edg') !== -1) {
			const edgeVersion = safeSplit(userAgent, 'Edg/')[1];
			const version = parseInt(safeSplit(edgeVersion, '.')[0]);
			return {
				name: 'Edge',
				version: version,
            }
        } else if (userAgent.indexOf('Chrome') !== -1) {
			const chromeVersion = safeSplit(userAgent, 'Chrome/')[1];
			const version = parseInt(safeSplit(chromeVersion, '.')[0]);
			return {
				name: 'Chrome',
				version: version,
			}
		}
		else if (userAgent.indexOf('IEMobile') !== -1) {
			const ieVersion = safeSplit(userAgent, 'IEMobile/')[1];
			const version = parseInt(safeSplit(ieVersion, ';')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
		}
        else if (userAgent.indexOf('AppleWebKit') !== -1 
            && userAgent.indexOf('Chrome') === -1
            && userAgent.indexOf('CriOS') === -1
            && userAgent.indexOf('FxiOS') === -1) {
			const safariVersion = safeSplit(userAgent, 'Version/')[1];
			const version = parseInt(safeSplit(safariVersion, '.')[0]);
			return {
				name: 'Safari',
				version: version,
			}
		}
		else if (userAgent.indexOf('Firefox') !== -1) {
			const ffVersion = safeSplit(userAgent, 'Firefox/')[1];
			const version = parseInt(safeSplit(ffVersion, '.')[0]);
			return {
				name: 'Firefox',
				version: version,
			}
		}
		else if (userAgent.indexOf('MSIE') !== -1) {
			const msVersion = safeSplit(userAgent, 'MSIE ')[1];
			const version = parseInt(safeSplit(msVersion, ';')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
		}
		else if (userAgent.indexOf('MSIE') === -1 && userAgent.indexOf('Trident') !== -1) {
			const msVersion = safeSplit(userAgent, 'rv:')[1];
			const version = parseInt(safeSplit(msVersion, '.')[0]);
			return {
				name: 'MSIE',
				version: version,
			}
        } 
        else if (userAgent.indexOf('CriOS') !== -1) {
            const chromeIOsVersion = safeSplit(userAgent, 'CriOS/')[1];
			const version = parseInt(safeSplit(chromeIOsVersion, '.')[0]);
			return {
				name: 'CriOS',
				version: version,
			}
        } else if (userAgent.indexOf('FxiOS') !== -1) {
            const ffIOsVersion = safeSplit(userAgent, 'FxiOS/')[1];
			const version = parseInt(safeSplit(ffIOsVersion, '.')[0]);
			return {
				name: 'FxiOS',
				version: version,
			}
        }
		// Other ???
		return {
			name: 'unknown',
			version: 0,
		}
    }
};

export type DEVICE_TYPE = 'Mobile' | 'Tablet' | 'Desktop';
export let deviceType: DEVICE_TYPE;

if (navigator.userAgent.match(/Mobile/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/IEMobile/i)
    || navigator.userAgent.match(/Windows Phone/i)
    || navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/webOS/i)) {
    deviceType = 'Mobile';
    document.getElementsByTagName('html')[0].setAttribute('mobile-device', '');
} else if (navigator.userAgent.match(/Tablet/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/Nexus 7/i)
    || navigator.userAgent.match(/Nexus 10/i)
    || navigator.userAgent.match(/KFAPWI/i)) {
    deviceType = 'Tablet';
        document.getElementsByTagName('html')[0].setAttribute('tablet-device', '');
} else {
    deviceType = 'Desktop';
    document.getElementsByTagName('html')[0].setAttribute('desktop-device','');
}
