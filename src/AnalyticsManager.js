const $ = require('jquery');

(function() {

    var self;

    var AnalyticsManager = function(cookieManager, themeManager, logger) {
        self = this;

        this.cookieManager = cookieManager;
        this.themeManager = themeManager;
        this.logger = logger;
        this.initialized = false;
        this.newPageLoad = true;
    };
    AnalyticsManager.prototype.initialize = function(callback) {
        if (this.initialized)
            return callback();

        var setUuid = callback => {
            $.get('/api/uuid', uuid => {
                var uuid = uuid.id;
                this.cookieManager.set('id', uuid);
                callback();
            });
        };
        var ensureUuid = callback => {
            var uuid = this.cookieManager.get('id');
            if (!uuid || uuid.length > 12)
                setUuid(callback);
            else
                callback();
        };
        ensureUuid(() => {
            this.initialized = true;
            callback();
        });
    };
    AnalyticsManager.prototype.reportAnalytics = function(callback) {
        var newPageLoad = this.newPageLoad;
        this.newPageLoad = false;

        var report = callback => {
            $.ajax({
                type: 'POST',
                url: '/api/analytics',
                data: {
                    id: this.cookieManager.get('id'),
                    newPageLoad: newPageLoad,
                    source: 'web',
                    theme: this.themeManager.getCurrentThemeName(),
                    userAgent: $(window)[0].navigator.userAgent
                },
                success: res => {
                    this.newPageLoad = false;

                    if (!res.success)
                        this.logger.warn('Analytics are disabled');
                    else
                        this.logger.success('Analytics data sent successfully');

                    if (callback)
                        callback();
                }
            })
        };

        return this.initialize(function() {
            report(callback);
        });
    };

    module.exports = AnalyticsManager;
    //window.AnalyticsManager = AnalyticsManager;
})();