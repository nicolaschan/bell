
/**
 * Acts as an intermediary between Chrome's cookie API and the extension.
 * The exposed interface is the same as CookieManager, because duck typing is
 * a useful thing.
 *
 * To use this, manifest.json must have "cookies" in its permissions.
 */

const $ = require("jquery");

/**
 * Creates a new instance of this pseudo-cookiemanager.
 * Instead of actually asking the browser for a cookie every time the get method
 * is invoked, all cookies are gotten upon initialization and stored in an object.
 * The get method of this manager performs a lookup on the object.
 *
 * @param {String} url
 * @param {Function} callback the setup function to be run after cookie initalization completes.
 */
var ChromeCookieManager = function(url, callback) {
	self = this;
	self.url = url;
	self.storedCookies = {};
	chrome.cookies.getAll({
		url: self.url
	}, function(cookies) {
		for(cookie of cookies) {
			// shoot me
			self.storedCookies[cookie.name] = JSON.parse("\"" + lint(cookie.value) + "\"");
		}
		callback();
	});
}

ChromeCookieManager.prototype.set = function(key, value, expires) {
	chrome.cookies.set(
		{
			url: this.url,
			name: key,
			value: JSON.stringify(value),
			expirationDate: expires ? (daysToSeconds(expires)) : (daysToSeconds(365))
		}, (cookie) => this.storedCookies[cookie.name] = cookie.value);
	return value;
};

ChromeCookieManager.prototype.get = function(key) {
	return this.storedCookies[key];
};

ChromeCookieManager.prototype.getJSON = function(key) {
	try {
		return JSON.parse(this.get(key));
	}
	catch(e) {
		return undefined;
	}
};

/**
 * Because the CookieManager class was written to take days until expiration
 * as an argument of set, and chrome.cookies sets an expiration date in terms
 * of seconds elapsed since the unix epoch, this is necessary.
 *
 * @param {int} days the number of days until expiration.
 * @return {double} the date of expiration, in terms of number of seconds since
 * the unix epoch.
 */
var daysToSeconds = function(days) {
	var d = new Date();
	d.setDate(days);
	return d.getTime() / 1000;
};

var lint = function(str) {
	str = decodeURI(str);
	str = str.replace(/\"/g,"\\\"");
	return str; 
}

module.exports = ChromeCookieManager;