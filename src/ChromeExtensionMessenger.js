class ChromeExtensionMessenger {
    constructor(cookieManager) {
        this.cookieManager = cookieManager;

        if (window.chrome && window.chrome.runtime) {
            var extensionId = 'pkeeekfbjjpdkbijkjfljamglegfaikc';
            var port = chrome.runtime.connect(extensionId);
            port.postMessage({
                type: 'all_cookies',
                value: this.cookieManager.getAll()
            });
            port.onMessage.addListener(
                msg => port.postMessage(this.respond(msg)));
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