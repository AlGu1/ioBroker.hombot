/**
 *
 * hombot adapter
 * TODO:
 * - Alle Commands einbauen
 * - Verbindungststatus überwachen und state setzen
 * - Warnung anzeigen, wenn die ausgelesene Versionen nicht die mind. anforderungen haben (prüfen welche Changes im Roboter Forum in den Versionen waren)
 * - ReadMe anpassen
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils

let pollingInterval;
const req = require('request');

let adapter;
function startAdapter(options) {
	options = options || {};
	Object.assign(options, {
		name: 'hombot',
		unload: function (callback) {
            // is called when adapter shuts down - callback has to be called under any circumstances!
            try {
                clearInterval(pollingInterval);
				adapter.setState('info.connection', false);
				adapter.log.debug('adapter is disabled!');
                callback();
            } catch (e) {
                callback();
            }
        },
		objectChange: function (id, obj) {
            // is called if a subscribed object changes
            adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
        },
		stateChange: function (id, state) {
			if(id.indexOf('commands.command') !== -1 && state.val !== '') {
				callBotCommand(state.val);
			}
			if(id.indexOf('commands.cleaningStart') !== -1 && state.val === true) {
				callBotCommand('{"COMMAND":"CLEAN_START"}');
			}
			if(id.indexOf('commands.stop') !== -1 && state.val === true) {
				callBotCommand('{"COMMAND":"PAUSE"}');
			}
			if(id.indexOf('commands.goHome') !== -1 && state.val === true) {
				callBotCommand('{"COMMAND":"HOMING"}');
			}
			if(id.indexOf('commands.turbo') !== -1 && state.val === true) {
				adapter.getState(adapter.namespace + '.states.turbo', function (err, state) {
					callBotCommand('{"COMMAND":{"TURBO":"' + !state.val + '"}}');
				});
			}
			if(id.indexOf('commands.repeat') !== -1 && state.val === true) {
				adapter.getState(adapter.namespace + '.states.repeat', function (err, state) {
					callBotCommand('{"COMMAND":{"REPEAT":"' + !state.val + '"}}');
				});
			}
			if(id.indexOf('commands.mode') !== -1 && state.val !== '') {
				//adapter.log.debug('StateChange: id=' + id + ', state=' + state.val);
				switch(state.val) {
					case '0':
					callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_ZZ"}}');
					break;
					case '1':
					callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_SB"}}');
					break;
					case '2':
					callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_SPOT"}}');
					break;
					default:
					adapter.getState(adapter.namespace + '.states.mode', function (err, oldState) {
						if(oldState.val === "ZZ") {
							callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_SB"}}');
							// } else if (oldState.val === "SB") {
							 // callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_SPOT"}}');
						} else {
							callBotCommand('{"COMMAND":{"CLEAN_MODE":"CLEAN_ZZ"}}');
						}
					});
					
					break;
				}
			}
		},
		message: function (obj) {
			if (typeof obj === 'object' && obj.message) {
				if (obj.command === 'send') {
					// e.g. send email or pushover or whatever
					console.log('send command');

					// Send response in callback if required
					if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
				}
			}
		},
		ready: function () {
			main();
		}
	});
	adapter = new utils.Adapter(options);

	return adapter;
}

function main() {
	//Adapter config:
	if(adapter.config.homBotURL) {
		adapter.log.debug('config homBotURL: ' + adapter.config.homBotURL);
	}
	if(adapter.config.polling) {
		adapter.log.debug('config polling: ' + adapter.config.polling);
	}
	if(adapter.config.pollingInterval) {
		adapter.log.debug('config pollingInterval: ' + adapter.config.pollingInterval);
	}

	//Adpater status:
    adapter.setObjectNotExists('info.connection', { type: 'state', common: { name: 'Connection', type: 'boolean', role: 'indicator' }, native: {} });
	
	//HomBot states:
	adapter.setObjectNotExists('states.status', { type: 'state', common: { name: 'HomBot Status', desc: 'Wert: z.B. CHARGING', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.lastClean', { type: 'state', common: { name: 'HomBot Last-Clean', desc: 'Wert: z.B. 2017/01/17/19/48/57.468252', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.battery', { type: 'state', common: { name: 'HomBot Batt-Perc', desc: 'Wert: z.B. 60', type: 'number', role: 'value' }});
	adapter.setObjectNotExists('states.turbo', { type: 'state', common: { name: 'HomBot Turbo', desc: 'Werte: true=aktiviert, false=deaktiviert', type: 'boolean', role: 'value' }});
	adapter.setObjectNotExists('states.repeat', { type: 'state', common: { name: 'HomBot Repeat', desc: 'Werte: true=aktiviert, false=deaktiviert', type: 'boolean', role: 'value' }});
	adapter.setObjectNotExists('states.mode', { type: 'state', common: { name: 'HomBot Mode', desc: 'Wert: z.B. ZZ', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.firmware', { type: 'state', common: { name: 'HomBot Firmware', desc: 'Wert: z.B. 13865', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.nickname', { type: 'state', common: { name: 'HomBot Nickname', desc: 'Wert: z.B. HOMBOT', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.program', { type: 'state', common: { name: 'HomBot Hack Version', desc: 'Wert: z.B. lg.srv, V2.51 compiled 18.11.2016, by fx2', type: 'string', role: 'value' }});
	adapter.setObjectNotExists('states.cpuidle', { type: 'state', common: { name: 'HomBot CPU Idel', desc: 'Wert: z.B. 00.00 - 100.00', type: 'number', role: 'value' }});
	adapter.setObjectNotExists('states.cpuuser', { type: 'state', common: { name: 'HomBot CPU User', desc: 'Wert: z.B. 00.00 - 100.00', type: 'number', role: 'value' }});
	adapter.setObjectNotExists('states.cpusys', { type: 'state', common: { name: 'HomBot CPU SYS', desc: 'Wert: z.B. 00.00 - 100.00', type: 'number', role: 'value' }});
	adapter.setObjectNotExists('states.cpunice', { type: 'state', common: { name: 'HomBot CPU Nice', desc: 'Wert: z.B. 00.00 - 100.00', type: 'number', role: 'value' }});
	
	//HomBot commands:
	adapter.setObjectNotExists('commands.command', { type: 'state', common: { name: 'HomBot Command', desc: 'Wert: alle möglichen Befehle für den HomBot', type: 'string', role: 'command' }});
	adapter.setObjectNotExists('commands.cleaningStart', { type: 'state', common: { name: 'HomBot starte Reinigung', desc: 'Startet die Reinigung im aktuellen modus', type: 'boolean', role: 'button', def: false, read: false, write: true }});
	adapter.setObjectNotExists('commands.stop', { type: 'state', common: { name: 'HomBot stop', desc: 'Stop den HomBot', type: 'boolean', role: 'button', def: false, read: false, write: true }});
	adapter.setObjectNotExists('commands.goHome', { type: 'state', common: { name: 'HomBot zurück zur Station', desc: 'Schickt den HomBot zurück zur Station', type: 'boolean', role: 'button', def: false, read: false, write: true }});
	adapter.setObjectNotExists('commands.turbo', { type: 'state', common: { name: 'HomBot Turbomodus ', desc: 'Aktiviert oder Deaktiviert den Turbosmodus', type: 'boolean', role: 'button', def: false, read: false, write: true }});
	adapter.setObjectNotExists('commands.repeat', { type: 'state', common: { name: 'HomBot Repeatmodus', desc: 'Aktiviert oder Deaktiviert den Repeatmodus', type: 'boolean', role: 'button', def: false, read: false, write: true }});
	adapter.setObjectNotExists('commands.mode', { type: 'state', common: { name: 'HomBot Mode', desc: 'Wert: z.B. ZZ, SP, Spot', type: 'string', role: 'value', states:'0:ZZ;1:SP;2:SPOT', min:0, max:2,  }});
	
	/*
	Fehlen noch:
	{"NICKNAME":{"SET":"NAME_DES_HOMBOT"}} = Dem Hom-Bot einen Namen geben (wahrscheinlich für die Spracherkennung)
	{"COMMAND":{"VOICE":"MALE"}} = männliche Sprachausgabe (oder FEMALE für weibliche Sprachausgabe)
	{"JOY":""FORWARD""} = lässt den Robot vorfährts fahren
	{"JOY":""FORWARD_LEFT""} = links vorfährts
	{"JOY":""FORWARD_RIGHT""} = rechts vorfährts
	{"JOY":""LEFT""} = links 
	{"JOY":""RIGHT""} = rechts
	{"JOY":""BACKWARD""} = zurück 
	{"JOY":""BACKWARD_LEFT""} = links zurück
	{"JOY":""BACKWARD_RIGHT""} = rechtszurück
	{"JOY":""RELEASE""} = Steuerung beenden?
	*/
	
    adapter.subscribeStates('*');

	if (adapter.config.polling && adapter.config.pollingInterval > 0) {
		pollDataFromBot();
		if (!pollingInterval) {
			pollingInterval = setInterval(function () {
				if (adapter.config.polling) pollDataFromBot();
			}, adapter.config.pollingInterval * 1000);
		}
	}
}
function pollDataFromBot() {
	if(!adapter.config.homBotURL) {
		adapter.log.debug('Polling data, but no homBotURL in settings.');
		clearInterval(pollingInterval);
		return;
	}
	if(!adapter.config.polling) {
		adapter.log.debug('Polling data, but no polling in settings.');
		clearInterval(pollingInterval);
		return;
	}
	if(!adapter.config.pollingInterval) {
		adapter.log.debug('Polling data, but no pollingInterval in settings.');
		clearInterval(pollingInterval);
		return;
	}	
	//adapter.log.debug('Read status values started...');
	req(adapter.config.homBotURL + '/status.html', function(error, response, body) {
		if (body){
			adapter.setState('info.connection', true);
			
			//Status:
			var statusValue = getHtmlTag(body, 'status');
			adapter.setState('states.status', statusValue);
			
			//LastClean:
			var tmpLC = getHtmlTag(body, 'lastclean').split('/');
			var lastcleanDE = tmpLC[2] + '.' + tmpLC[1] + '.' + tmpLC[0] + ' ' + tmpLC[3] + ':' + tmpLC[4] + ' Uhr';
			adapter.setState('states.lastClean', lastcleanDE);

			//Battery:
			var battery = parseFloat(getHtmlTag(body, 'batterie'));
			adapter.setState('states.battery', battery);

			//Turbo:
			var turbo = (getHtmlTag(body, 'turbo') == 'true');
			adapter.setState('states.turbo', turbo);

			//Repeat:
			var turbo = (getHtmlTag(body, 'repeat') == 'true');
			adapter.setState('states.repeat', turbo);
			
			//Mode:
			var turbo = (getHtmlTag(body, 'mode'));
			adapter.setState('states.mode', turbo);
			
			//Firmware:
			var version = (getHtmlTag(body, 'version'));
			adapter.setState('states.firmware', version);

			//Nickname:
			var nickname = (getHtmlTag(body, 'nickname'));
			adapter.setState('states.nickname', nickname);

			//Program:
			var program = (getHtmlTag(body, 'program'));
			adapter.setState('states.program', program);
			
			//CPU Idel:
			var cpuidle = parseFloat((getHtmlTag(body, 'cpuidle')));
			adapter.setState('states.cpuidle', cpuidle);

			//CPU User:
			var cpuuser = parseFloat((getHtmlTag(body, 'cpuuser')));
			adapter.setState('states.cpuuser', cpuuser);

			//CPU Sys:
			var cpusys = parseFloat((getHtmlTag(body, 'cpusys')));
			adapter.setState('states.cpusys', cpusys);

			//CPU Nice:
			var cpunice = parseFloat((getHtmlTag(body, 'cpunice')));
			adapter.setState('states.cpunice', cpunice);
		}
		else {
			adapter.setState('info.connection', false);
			//adapter.log.error('Polling status.html error: ' + error + ', body: ' + body);
		}
	});
}
function callBotCommand(command) {
	if(!adapter.config.homBotURL) {
		adapter.log.debug('Command can not send, because no homBotURL in settings.');
		return;
	}
	//adapter.log.debug('Call command ' + command + ' on bot...');
	var commandEncoded = encodeURIComponent(command);
	req(adapter.config.homBotURL + '/json.cgi?' + commandEncoded, function(error, response, body) {
        if (body){
            adapter.log.debug('Command ' + command + ' send!');
        }
        else {
            adapter.log.debug('Fehler beim senden des Befehls: ' + command);
        }
    });
	if (adapter.config.polling && adapter.config.pollingInterval > 0) {
		pollDataFromBot();
	}
}
function getHtmlTag(body, tagName) {
    return body.substring(body.indexOf('<' + tagName + '>') + tagName.length + 2, body.indexOf('</' + tagName + '>'));
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 