(function() {

  const cookieName = 'classes';

  var ClassesManager = function(cookieManager) {
    this.cookieManager = cookieManager;
  };

  ClassesManager.prototype.setClasses = function(classes) {
    this.cookieManager.set(cookieName, classes);
  };
  ClassesManager.prototype.getClasses = function() {
    if (!this.cookieManager.get(cookieName))
      this.setClasses(['Period 0', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7']);
    return this.cookieManager.get(cookieName);
  };

  module.exports = ClassesManager;
  //window.ClassesManager = ClassesManager;
})();