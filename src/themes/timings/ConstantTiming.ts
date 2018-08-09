import { TimingFunction, ThemeFunction, BellTimer } from './Timing'
import { ColorScheme, Color } from '../ColorSchemeTransformations'

export default function (interval: number): TimingFunction {
  return function (colors: ColorScheme<Color>[], special: { [schedule: string]: ColorScheme<Color> } = {}): ThemeFunction {
    return function (bellTimer: BellTimer): ColorScheme<Color> {
      const time = Math.floor(bellTimer.getTimeRemainingMs() / 1000)
      return colors[Math.floor(time / interval) % colors.length]
    }
  }
}
