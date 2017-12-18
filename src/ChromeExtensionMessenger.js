const logger = new (require('./SimpleLogger.js'))();

class ChromeExtensionMessenger {
    constructor(cookieManager) {
        this.cookieManager = cookieManager;
    }

    connect(extensionId) {
        logger.log("Attempting to connect to host...", "ChromeExtensionMessenger");
        if (window.chrome && window.chrome.runtime) {
            var port = chrome.runtime.connect(extensionId);
            port.postMessage({
                type: 'all_cookies',
                value: this.cookieManager.getAll()
            });
            // TODO add client success/failure messages
            logger.success("Connection success.");
            port.onMessage.addListener(
                msg => port.postMessage(this.respond(msg)));
        }
        else {
            logger.warn("Connection failed.");
        }
    }

    respond(msg) {
        switch (msg.type) {
            case 'getAll':
                return {
                    type: 'getAll',
                    value: this.cookieManager.getAll()
                };
            case 'get':
                return {
                    type: 'get',
                    value: this.cookieManager.get(msg.key)
                };
            case 'set':
                return {
                    type: 'set',
                    value: this.cookieManager.set(msg.key, msg.value)
                };
            case 'remove':
                return {
                    type: 'remove',
                    value: this.cookieManager.remove(msg.key)
                };
            case 'clear':
                return {
                    type: 'clear',
                    value: this.cookieManager.clear()
                };
        }
    }
}

module.exports = ChromeExtensionMessenger;