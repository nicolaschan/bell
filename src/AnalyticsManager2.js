class AnalyticsManager {
    constructor(cookieManager, themeManager, logger) {
        this.cookieManager = cookieManager;
        this.themeManager = themeManager;
        this.logger = logger;

        // Report analytics counts as a page hit
        this.newPageLoad = true;
    }

    async initialize() {
        if (this.initialized)
            return;

        var uuid = this.cookieManager.get('id');
        if (!uuid) {
            uuid = (await requestManager.getNoCache('/api/uuid')).id;
            this.cookieManager.set('id', uuid);
        }
    }

    async reportAnalytics() {
        await this.initialize();

        var send;
        try {
            send = await requestManager.post('/api/analytics', {
                id: this.cookieManager.get('id'),
                newPageLoad: this.newPageLoad,
                theme: this.themeManager.getCurrentThemeName(),
                userAgent: $(window)[0].navigator.userAgent,
                source: this.cookieManager.get('source')
            });
        } catch (e) {
            this.logger.warn('Analytics sending failed');
            return send;
        }

        this.newPageLoad = false;

        if (send.success)
            this.logger.success('Analytics data sent successfully');
        else
            this.logger.warn('Analytics are disabled');

        return send;
    }
}

module.exports = AnalyticsManager;