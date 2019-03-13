/*
    ioBroker.hombot Widget-Set

    version: "0.0.3"

    Copyright 2018 Alexander Gurtzick<algu1@outlook.de>

*/
"use strict";

var dataCounter = 3;

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "group_showvalues": 	{"en": "Show values",   "de": "Werte anzeigen"},
        "group_showbuttons": 	{"en": "Show buttons",  "de": "Schaltflächen anzeigen"},
		"showIcon":      		{"en": "Icon", 			"de": "Bild"},
		"showOnline":      		{"en": "Online", 		"de": "Verbunden"},
 		"showButtonStart":      {"en": "Start", 		"de": "Start"},
 		"showButtonStop":      	{"en": "Stop", 			"de": "Stop"},
 		"showButtonHome":      	{"en": "Go home", 		"de": "Zur Basis"},
 		"showButtonMode":      	{"en": "Mode", 			"de": "Modus"},
 		"showButtonRepeat":     {"en": "Repeat", 		"de": "Repeat"},
 		"showButtonTurbo":      {"en": "Turbo", 		"de": "Turbo"},
 		"showBattery":      	{"en": "Battery", 		"de": "Batterie"},
        "showStatus":       	{"en": "Status",      	"de": "Status"},
        "showLastClean":    	{"en": "Last clean",    "de": "Letzte Reinigung"},
        "showMode":    			{"en": "Mode",    		"de": "Modus"},
        "showRepeat":    		{"en": "Repeate",   	"de": "Repeate"},
        "showTurbo":    		{"en": "Turbo", 	   	"de": "Turbo"}	
    });
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    "Instance":  {"en": "Instance", "de": "Instanz"},
	"Batterie":  {"en": "Battery", "de": "Batterie"},
	"Status":  {"en": "Status", "de": "Status"},
	"Letzte Reinig.":  {"en": "Last clean", "de": "Letzte Reinig."},
	"Modus":  {"en": "Mode", "de": "Modus"},
	"Repeat":  {"en": "Repeat", "de": "Repeat"},
	"Turbo":  {"en": "Turbo", "de": "Turbo"}
});

// this code can be placed directly in hombot.html
vis.binds.hombot = {
    version: "0.0.3",
    showVersion: function () {
        if (vis.binds.hombot.version) {
            console.log('Version hombot: ' + vis.binds.hombot.version);
            vis.binds.hombot.version = null;
        }
    },
	bindData: function (widgetID, view, data, style) {
        var div = $('#' + widgetID);
        // if nothing found => wait
        if (!div.length) {
            return setTimeout(function () {
                vis.binds.hombot.bindData(widgetID, view, data, style);
            }, 1000);
        }
        // subscribe on updates of value
        if (data.oid) {
			vis.states.bind(data.oid + '.info.connection.val', function (e, newVal, oldVal) {
                setConnectionState(data, div);
            });
            vis.states.bind(data.oid + '.states.battery.val', function (e, newVal, oldVal) {
                setStateValue('battery', '&nbsp;%', data, div);
            });
			vis.states.bind(data.oid + '.states.status.val', function (e, newVal, oldVal) {
                setStateValue('status', null, data, div);
            });
			vis.states.bind(data.oid + '.states.lastClean.val', function (e, newVal, oldVal) {
				setStateValue('lastClean', null, data, div);
            });
			vis.states.bind(data.oid + '.states.mode.val', function (e, newVal, oldVal) {
				setStateValue('mode', null, data, div);
            });
			vis.states.bind(data.oid + '.states.repeat.val', function (e, newVal, oldVal) {
				setStateValue('repeat', null, data, div);
            });
			vis.states.bind(data.oid + '.states.turbo.val', function (e, newVal, oldVal) {
				setStateValue('turbo', null, data, div);
            });
			
			setAllData(data, div);
        }
    }
};

function setAllData(data, div) {
	if (vis.states[data.oid + '.info.connection.val'] === undefined && dataCounter > 0) {
		dataCounter--;
		return setTimeout(function () {
			setAllData(data, div);
		}, 2000);
	}
	setConnectionState(data, div);
	setStateValue('battery', '&nbsp;%', data, div);
	setStateValue('status', null, data, div);
	setStateValue('lastClean', null, data, div);
	setStateValue('mode', null, data, div);
	setStateValue('repeat', null, data, div);
	setStateValue('turbo', null, data, div);
}

function setConnectionState(data, div) {
	var conn = 'widgets/hombot/img/offline.png';
	if (vis.states[data.oid + '.info.connection.val'] === true) {
		conn = 'widgets/hombot/img/online.png';
	}
	div.find('#hombot-connection').attr('src', conn);
}
function setStateValue(stateId, extension, data, div) {
	var value = vis.states[data.oid + '.states.' + stateId + '.val'];
	if (value !== undefined) {
		if(!extension) {
			extension = '';
		}
		div.find('#hombot-' + stateId).html(value + extension);
	}
	else {
		//setTimeout aufrufen und noch mal versuchen...
		
	}
}

vis.binds.hombot.showVersion();