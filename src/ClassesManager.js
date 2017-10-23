(function() {

    const cookieName = 'classes';

    var ClassesManager = function(cookieManager) {
        this.cookieManager = cookieManager;
    };

    ClassesManager.prototype.setClasses = function(classes) {
        this.cookieManager.set(cookieName, classes);
    };
    ClassesManager.prototype.getClasses = function() {
        return this.cookieManager.get(cookieName, ['Period 0', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7']);
    };

    module.exports = ClassesManager;
    //window.ClassesManager = ClassesManager;
})();