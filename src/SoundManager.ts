import cookieManager from './LocalForageCookieManager'
import SimpleLogger from './SimpleLogger'

const SOUND_ENABLED_KEY = 'play_sound'
const DEFAULT_SOUND_STATE = false

const logger = new SimpleLogger()

class SoundManager {
  private hasInteracted: boolean = false

  public playSound () {
    if (!this.isEnabled() || !this.hasInteracted) {
      return
    }

    const audio = new Audio('/sounds/bell.mp3')
    audio.play().catch((e) => {
      logger.error(`Error playing sound: ${e}`)
    })
  }

  public reportInteraction () {
    this.hasInteracted = true
  }

  public getHasInteracted () {
    return this.hasInteracted
  }

  public setEnabled (enabled: boolean) {
    cookieManager.set(SOUND_ENABLED_KEY, enabled).catch((e) => {
      // not much we can do
    })
  }

  public isEnabled () {
    return cookieManager.get(SOUND_ENABLED_KEY, DEFAULT_SOUND_STATE)
  }
}

export default new SoundManager()
