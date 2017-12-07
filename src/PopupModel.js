class PopupModel {
    constructor(cookieManager, requestManager) {
        this.cookieManager = cookieManager;
        this.requestManager = requestManager;
        this.refresh();
    }

    get visible() {
        return this.text && this.text != this.cookieManager.get('popup');
    }
    set visible(visible) {
        if (visible)
            this.cookieManager.remove('popup');
        else
            this.cookieManager.set('popup', this.text);
    }

    async refresh() {
        var message = await this.requestManager.get('/api/message');
        this.text = message.text.trim();
        this.href = message.href;
    }
}

module.exports = PopupModel;