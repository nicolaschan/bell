class UIModel {
    constructor(bellTimer, cookieManager, themeManager, analyticsManager, requestManager, popupModel) {
        this.bellTimer = bellTimer;
        this.cookieManager = cookieManager;
        this.themeManager = themeManager;
        this.analyticsManager = analyticsManager;
        this.requestManager = requestManager;
        this.popupModel = popupModel;
        this.state = {
            loadingMessage: {
                visible: true,
                value: ''
            }
        };
    }

    setLoadingMessage(message) {
        this.state.loadingMessage = {
            visible: true,
            value: message
        };
    }
    hideLoading() {
        this.state.loadingMessage.visible = false;
    }

    async initialize() {
        this.state.ready = true;
    }
}

module.exports = UIModel;