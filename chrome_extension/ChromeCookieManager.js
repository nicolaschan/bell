
/**
 * Acts as an intermediary between Chrome's cookie API and the extension.
 * The exposed interface is the same as CookieManager, because duck typing is
 * a useful thing.
 *
 * To use this, manifest.json must have "cookies" in its permissions.
 */

var self;

const lengthThreshold = 4000;
var btoa = window.btoa;
var atob = window.atob;

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
			self.storedCookies[cookie.name] = atob(cookie.value);
		}
		callback();
		console.log("All cookies", cookies);
	});
}

ChromeCookieManager.prototype.set = function(key, value, expires) {
	return null;
	var val = encodeURI((typeof value == 'string') ? value : JSON.stringify(value));
	var valBase64 = btoa(val);
	if(valBase64.length > lengthThreshold)
		return this.setLong(key, value, expires);
	else
		return this.setRaw(key, valBase64, expires);
}

ChromeCookieManager.prototype.setRaw = function(key, value, expires) {
	val = encodeURI((typeof value == 'string') ? value : JSON.stringify(value));
	chrome.cookies.set(
		{
			url: self.url,
			name: key,
			value: val,
			expirationDate: expires ? (daysToSeconds(expires)) : (daysToSeconds(365))
		}, function(cookie) {
			if(!cookie) {
				console.log(key);
				console.log(value);
				throw new Error("Who took the cookie from the cookie jar?");
			}
			self.storedCookies[key] = cookie.value;
		});
	return value;
};

ChromeCookieManager.prototype.get = function(key) {
	var valBase64 = this.getRaw(key);
	try {
		if(valBase64)
			return atob(valBase64);
		else
			return undefined;
	} catch (e) {
		self.convertCookieToBase64(key);
		return valBase64;
	}
}

ChromeCookieManager.prototype.getRaw = function(key) {
	if(self.storedCookies[key])
		return decodeURI(self.storedCookies[key]).replace(/%5D/g,"]").replace(/%5B/g,"[").replace(/%2C/g,",");
};

ChromeCookieManager.prototype.convertCookieToBase64 = function(key) {
	self.set(key, self.getRaw(key));
}

ChromeCookieManager.prototype.getJSON = function(key) {
	try {
		return JSON.parse(self.get(key));
	}
	catch(e) {
		return undefined;
	}
};

var splitString = function(str, length) {
    var parts = [];
    for (var i = 0; i < str.length; i += length) {
     	parts.push(str.substring(i, i + length));
    }
    return parts;
};
ChromeCookieManager.prototype.getLong = function(key) {
	var longValue = '';
	for (var i = 0; self.getRaw(key + '_' + i); i++) {
		longValue += self.getRaw(key + '_' + i);
	}
	try {
		return atob(longValue)
	} catch(e) {
		return undefined;
	}
};
ChromeCookieManager.prototype.getLongJSON = function(key) {
	return JSON.parse(self.getLong(key));
};
ChromeCookieManager.prototype.setLong = function(key, longValue, expires) {
	if (typeof longValue != 'string')
		longValue = JSON.stringify(longValue);
	longValue = btoa(longValue);
	var parts = splitString(longValue, 2000);
	for (var i = 0; i < parts.length; i++) {
		self.set(key + '_' + i, parts[i], expires);
	}
	// clears unused cookies
	for(j = i; j < self.get(key + "_" + j); j++) {
		chrome.cookies.remove({
			url: self.url,
			name: key + "_" + j
		}, function(cookie) {
			self.storedCookies[cookie.name] = undefined;
		});
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

/**
 * Because js is an abomination of a language, we need to do this. It replaces 
 * any instances of "%2C" with a comma, and any other weird character that might
 * need replacing with whatever it's supposed to be. Oh, and it escapes quotes.
 * BECAUSE REASONS.
 * If decodeURI starts to fail for some unknown reason, use this.
 */
var lint = function(str) {
	str = decodeURI(str);
	str = str.replace(/%2C/g,",");
	str = escapeAllQuotes(str);
	return str; 
}

var escapeAllQuotes = function(str) {
	return str.replace(/\"/g,"\\\"");
}

module.exports = ChromeCookieManager;