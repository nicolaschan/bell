import { IColor, IColorScheme } from '../ColorSchemeTransformations'
import { IBellTimer, ThemeFunction, TimingFunction } from './Timing'

export default function (interval: number): TimingFunction {
  return (colors: Array<IColorScheme<IColor>>,
          special: { [schedule: string]: IColorScheme<IColor> } = {}): ThemeFunction => {
    return (bellTimer: IBellTimer): IColorScheme<IColor> => {
      const time = Math.floor(bellTimer.getTimeRemainingMs() / 1000)
      return colors[Math.floor(time / interval) % colors.length]
    }
  }
}
