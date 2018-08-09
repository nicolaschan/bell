import { Color, ColorScheme } from '../ColorSchemeTransformations'

export type TimingFunction = (colors: ColorScheme<Color>[], special: { [schedule: string]: ColorScheme<Color> }) => ThemeFunction
export type ThemeFunction = (bellTimer: BellTimer) => ColorScheme<Color>

export interface BellTimer {
  getTimeRemainingMs: () => number
}
