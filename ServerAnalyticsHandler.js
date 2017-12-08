const Promise = require('bluebird');
const UAParser = require('ua-parser-js');
const sqlite3 = Promise.promisifyAll(require('sqlite3').verbose());
var db = new sqlite3.Database('analytics.sqlite');

const ServerAnalyticsHandler = {
    initialize: async() => db.runAsync('CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, timestamp DATETIME)'),
    recordHit: async(user) => {
        var result = UAParser(user.userAgent);
        var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'unknown device';
        return db.runAsync('INSERT INTO hits VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
            user.id, user.userAgent, result.browser.name, device, result.os.name,
            user.theme, user.source, user.ip);
    },
    getBrowserStats: async() => db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp))\
    	SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser'),
    getOSStats: async() => db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp))\
    	SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os'),
    getDeviceStats: async() => db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp))\
    	SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device'),
    getThemeStats: async() => db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp))\
    	SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme'),
    getSourceStats: async() => db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp))\
    	SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source'),
    getUsers: async() => db.allAsync('SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp\
    	FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)'),
    getTotalDailyHits: async() => db.allAsync('SELECT DATE(timestamp, "localtime") AS date, count(*) AS count FROM hits GROUP BY date'),
    getUniqueDailyHits: async() => db.allAsync('SELECT DATE(timestamp, "localtime") AS date, count(DISTINCT user) AS count FROM hits GROUP BY date')
};
module.exports = ServerAnalyticsHandler;