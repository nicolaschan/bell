const AlarmManager = require("./AlarmManager.js")
const ChromeCookieManagerFactory = require("./ChromeCookieManager2.js");
const BellTimer = require("../../src/BellTimer.js");
const RequestManager = require("../../src/RequestManager.js");

const hostname = "http://localhost:8005";

(async function() {
	const cookman = await ChromeCookieManagerFactory();
	const reqman = new RequestManager(cookman, hostname);
	const bellTimer = new BellTimer(cookman, reqman);
	global.bellTimer = bellTimer;
	await bellTimer.initialize();
	const alarmManager = new AlarmManager(bellTimer, cookman);
	global.alarmManager = alarmManager;

	if (alarmManager) {
		alarmManager.start();
	}
	else {
		console.log("Failed to load alarms.");
	}
})();
