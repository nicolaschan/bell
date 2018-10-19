import { ITheme } from './themes/timings/Timing'

import { dark as BluesDark, light as BluesLight } from './themes/Blues'
import { dark as DefaultDark, light as DefaultLight } from './themes/Default'
import * as GradientLight from './themes/GradientLight'
import { dark as GraysDark, light as GraysLight } from './themes/Grays'
import * as Halloween from './themes/Halloween'
import * as Jonathan from './themes/Jonathan'
import { dark as PastelDark, light as PastelLight } from './themes/Pastel'
import { dark as RainbowDark, light as RainbowLight } from './themes/Rainbow'

const themes: ITheme[] = [
  Halloween,
  DefaultLight,
  DefaultDark,
  GradientLight,
  PastelLight,
  PastelDark,
  RainbowLight,
  RainbowDark,
  GraysLight,
  GraysDark,
  BluesLight,
  BluesDark,
  Jonathan
]

export default class ThemeManager {

  private secrets: string[]

  private themeName?: string
  private themes: { [themeName: string]: ITheme }

  constructor (themeName?: string, secrets?: string[]) {
    this.themeName = themeName
    this.secrets = secrets || []

    this.themes = {}
    for (const theme of themes) {
      this.themes[theme.name] = theme
    }
  }

  get defaultTheme (): ITheme {
    // The first available theme in the array is the default
    for (const theme of themes) {
      if (this.isAvailable(theme.name)) {
        return theme
      }
    }
    return DefaultLight
  }

  set currentThemeName (themeName: string) {
    this.themeName = themeName
  }

  get currentThemeName (): string {
    return this.themeName || this.defaultTheme.name
  }

  get currentTheme (): ITheme {
    const theme = this.themes[this.currentThemeName]
    if (!theme || !this.isAvailable(theme.name)) {
      this.currentThemeName = this.defaultTheme.name
      return this.themes[this.currentThemeName]
    }
    return theme
  }

  public isAvailable (themeName: string): boolean {
    return !this.themes[themeName].enabled
      || this.themes[themeName].enabled!()
  }

  get availableThemes () {
    const available: string[] = []

    for (const name in this.themes) {
      if (this.isAvailable(name)) {
        available.push(name)
      }
    }

    return available
  }
}
