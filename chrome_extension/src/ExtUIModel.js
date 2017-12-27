class ExtUIModel {
  constructor (bellTimer, cookieManager, themeManager, /* analyticsManager, */requestManager/*, popupModel */) {
    this.bellTimer = bellTimer
    this.cookieManager = cookieManager
    this.themeManager = themeManager
        // this.analyticsManager = analyticsManager;
    this.requestManager = requestManager
        // this.popupModel = popupModel;
    this.state = {
      loadingMessage: {
        visible: true,
        value: 'Loading...'
      }
    }
  }

  setLoadingMessage (message) {
    this.state.loadingMessage = {
      visible: true,
      value: message
    }
  }
  hideLoading () {
    this.state.loadingMessage.visible = false
  }

  async initialize () {
    this.state.ready = true
  }
}

module.exports = ExtUIModel
