import cookieManager from './LocalForageCookieManager'
import SimpleLogger from './SimpleLogger'

const SOUND_ENABLED_KEY = 'play_sound'
const SOUND_SELECTION_KEY = 'sound_selection'
const CUSTOM_SOUND_KEY = 'custom_sound'
const DEFAULT_SOUND_STATE = false

const logger = new SimpleLogger()

export interface ISoundOption {
  id: string
  name: string
}

export const SOUND_OPTIONS: ISoundOption[] = [
  { id: 'default', name: 'Default bell' },
  { id: 'church', name: 'Church bell' },
  { id: 'ding', name: 'Ding' },
  { id: 'magic', name: 'Magic' }
]

interface ITone {
  frequency: number
  start: number
  duration: number
  gain: number
}

// Synthesized sounds so no extra audio files have to be shipped
const SYNTHESIZED: { [id: string]: ITone[] } = {
  church: [
    { frequency: 196, start: 0, duration: 3.5, gain: 0.5 },
    { frequency: 392, start: 0, duration: 2.5, gain: 0.3 },
    { frequency: 470, start: 0, duration: 2, gain: 0.15 },
    { frequency: 588, start: 0, duration: 1.5, gain: 0.1 },
    { frequency: 196, start: 1.2, duration: 3.5, gain: 0.4 },
    { frequency: 392, start: 1.2, duration: 2.5, gain: 0.25 }
  ],
  ding: [
    { frequency: 1318.5, start: 0, duration: 1.2, gain: 0.4 },
    { frequency: 2637, start: 0, duration: 0.6, gain: 0.1 }
  ],
  magic: [
    { frequency: 1046.5, start: 0, duration: 0.6, gain: 0.25 },
    { frequency: 1318.5, start: 0.09, duration: 0.6, gain: 0.25 },
    { frequency: 1568, start: 0.18, duration: 0.6, gain: 0.25 },
    { frequency: 2093, start: 0.27, duration: 0.9, gain: 0.25 },
    { frequency: 2637, start: 0.36, duration: 1.2, gain: 0.2 }
  ]
}

class SoundManager {
  private hasInteracted: boolean = false
  private audioContext: any = null

  public playSound () {
    if (!this.isEnabled() || !this.hasInteracted) {
      return
    }
    this.preview(this.getSelection())
  }

  // Play a sound regardless of whether sounds are enabled (used for previews)
  public preview (id: string) {
    if (SYNTHESIZED[id]) {
      return this.playTones(SYNTHESIZED[id])
    }
    const custom = cookieManager.get(CUSTOM_SOUND_KEY)
    const src = id === 'custom' && custom ? custom.data : '/sounds/bell.mp3'
    const audio = new Audio(src)
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

  public getSelection (): string {
    const selection = cookieManager.get(SOUND_SELECTION_KEY, 'default')
    if (selection === 'custom' && !cookieManager.get(CUSTOM_SOUND_KEY)) {
      return 'default'
    }
    return selection
  }

  public setSelection (id: string) {
    cookieManager.set(SOUND_SELECTION_KEY, id).catch((e) => {
      // not much we can do
    })
  }

  public getCustomSoundName (): string | null {
    const custom = cookieManager.get(CUSTOM_SOUND_KEY)
    return custom ? custom.name : null
  }

  // Store an uploaded audio file (as a data URL) and select it
  public async setCustomSound (name: string, data: string) {
    await cookieManager.set(CUSTOM_SOUND_KEY, { name, data })
    this.setSelection('custom')
  }

  private playTones (tones: ITone[]) {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) {
      return
    }
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    const ctx = this.audioContext
    const now = ctx.currentTime
    for (const tone of tones) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = tone.frequency
      gain.gain.setValueAtTime(0.0001, now + tone.start)
      gain.gain.exponentialRampToValueAtTime(tone.gain, now + tone.start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(now + tone.start)
      oscillator.stop(now + tone.start + tone.duration)
    }
  }
}

export default new SoundManager()
