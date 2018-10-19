import { IColor, IColorScheme } from '../ColorSchemeTransformations'

export type TimingFunction = (colors: Array<IColorScheme<IColor>>,
                              special: { [schedule: string]: IColorScheme<IColor> }) => ThemeFunction
export type ThemeFunction = (bellTimer: IBellTimer) => IColorScheme<IColor>

export interface IBellTimer {
  getTimeRemainingMs: () => number
}

export interface ITheme {
  name: string,
  // Eventually, .enabled() should be made a
  // pure function of bellTimer and cookieManager
  enabled?: (secrets: string[]) => boolean,
  theme: ThemeFunction
}
