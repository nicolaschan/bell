import cookieManager from './LocalForageCookieManager'

// source: https://stackoverflow.com/a/12709880
declare global {
    interface Window { Notification: any } // tslint:disable-line
}

window.Notification = window.Notification || {}
// end stackoverflow source

const NOTIFICATION_KEY = 'enable_notifications'
const DEFAULT_NOTIFICATION_STATE = false

class NotificationManager {
  public notificationsAllowed () {
    return ('Notification' in window) && window.Notification.permission === 'granted'
  }

  public notificationsBlocked () {
    return (!('Notification' in window)) || window.Notification.permission === 'denied'
  }

  public sendNotification (title: string, body: string) {
    if (this.isEnabled() && title) {
      const notification = new window.Notification(title, { body })
      setTimeout(() => notification.close(), 3 * 60 * 1000)
    }
  }

  public isEnabled () {
    return cookieManager.get(NOTIFICATION_KEY, DEFAULT_NOTIFICATION_STATE) // && this.notificationsAllowed()
  }

  public async enable () {
    await this.askPermission()
    cookieManager.set(NOTIFICATION_KEY, true).catch((e) => {
      // not much we can do
    })
  }

  public disable () {
    cookieManager.set(NOTIFICATION_KEY, false).catch((e) => {
      // not much we can do
    })
  }

  private async askPermission () {
    if (!('Notification' in window)) {
      return false
    }
    if (window.Notification.permission === 'granted') {
      return true
    }
    if (window.Notification.permission === 'default') {
      const permission = await window.Notification.requestPermission()
      if (permission === 'granted') {
        return true
      }
    }
    return false
  }
}

export default new NotificationManager()
