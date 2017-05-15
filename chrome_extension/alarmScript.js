
const BellTimer = require("../js/BellTimer.js");
const ChromeCookieManager = require("./ChromeCookieManager.js");
const ClassesManager = require("../js/ClassesManager.js");

var alarms = chrome.alarms;

const beta = false;

const host = "https://bell" + (beta ? "-beta" : "") + ".lahs.club";

var correction;

var initializeAlarm = function() {
	bellTimer.initializeFromHost(host);
	console.log("Alarm initialized");
	// bellTimer.enableDevMode(new Date('2017-05-12 8:00'), 60);
	refresh();
}

var cookman = new ChromeCookieManager("http://bell" + (beta ? "-beta" : "") + ".lahs.club",  function() {
	alarms.onAlarm.addListener(function(alarm) {
		console.log("Next alarm:", alarm);
		refresh();
	});
});

var classes = new ClassesManager(cookman);
var bellTimer = new BellTimer(classes, cookman);

var nextIconColor = "lime";
var nextIconPath = () => ("sizedicons/" + nextIconColor + ".png?v=1");

var updateIconAndAlarm = function() {
	var time = bellTimer.getTimeRemainingString();
	var min = parseInt(time.split(':')[time.split(':').length - 2]) + (parseInt(time.split(':')[time.split(':').length - 1]) / 60);
	var msRemaining = bellTimer.getTimeRemainingNumber();
	var nextAlarmTime;
	if(time.split(':').length > 2)
		min = 60;
	chrome.browserAction.setIcon({path: {"16": nextIconPath()} });
	if(min >= 15) { // Next icon is yellow
		nextIconColor = "yellow";
		nextAlarmTime = msRemaining - minToMS(15);
	}
	else if(min >= 5) { // Next icon is orange
		nextIconColor = "orange";
		nextAlarmTime = msRemaining - minToMS(5);
	}
	else if(min >= 2) { // Next icon is red
		nextIconColor = "red";
		nextAlarmTime = msRemaining - minToMS(2);
	}
	else { // Next icon is green
		nextIconColor = "lime";
		nextAlarmTime = msRemaining;
	}
	console.log("Next icon color:", nextIconColor);
	console.log("Next alarm time:", nextAlarmTime);
	alarms.create(nextIconColor, {when: (Date.now() + nextAlarmTime)});
}

var refresh = function() {
	bellTimer.reloadDataFromHost(host, function() {
		updateIconAndAlarm();
	});
}

var minToMS = function(mins) {
	return mins * 60 * 1000;
}

initializeAlarm();

// uses https://developer.chrome.com/extensions/alarms
// and http://stackoverflow.com/questions/8894461/updating-an-extension-button-dynamically-inspiration-required

