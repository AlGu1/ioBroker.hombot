/*
    ioBroker.hombot Widget-Set

    version: "0.0.2"

    Copyright 2018 Alexander Gurtzick<algu1@outlook.de>

*/
"use strict";

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
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.hombot.bindData(widgetID, view, data, style);
            }, 100);
        }
        // subscribe on updates of value
        if (data.oid) {
            vis.states.bind(data.oid + '.states.battery.val', function (e, newVal, oldVal) {
                $div.find('#hombot-battery').html(newVal + '&nbsp;%');
            });
			vis.states.bind(data.oid + '.states.status.val', function (e, newVal, oldVal) {
                $div.find('#hombot-status').html(newVal);
            });
			vis.states.bind(data.oid + '.states.lastClean.val', function (e, newVal, oldVal) {
                $div.find('#hombot-lastClean').html(newVal);
            });
			vis.states.bind(data.oid + '.states.mode.val', function (e, newVal, oldVal) {
                $div.find('#hombot-mode').html(newVal);
            });
			vis.states.bind(data.oid + '.states.repeat.val', function (e, newVal, oldVal) {
                $div.find('#hombot-repeat').html(newVal);
            });
			vis.states.bind(data.oid + '.states.turbo.val', function (e, newVal, oldVal) {
                $div.find('#hombot-turbo').html(newVal);
            });
        }
    }
};
vis.binds.hombot.showVersion();