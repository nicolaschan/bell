import { IColor, IColorScheme } from '../ColorSchemeTransformations'

export type TimingFunction = (colors: Array<IColorScheme<IColor>>,
                              special: { [schedule: string]: IColorScheme<IColor> }) => ThemeFunction
export type ThemeFunction = (bellTimer: IBellTimer) => IColorScheme<IColor>

export interface IBellTimer {
  getTimeRemainingMs: () => number
}

export interface ITheme {
  name: string,
  locked?: string,
  theme: ThemeFunction
}
