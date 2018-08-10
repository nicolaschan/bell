export type ShorthandColor = string | object
export interface IColor { [property: string]: string } // a CSS properties object

export interface IColorScheme<T> {
  background: T
  text: T
  subtext: T
  contrast: T
}

function shorthandToColor (shorthand: ShorthandColor, property: string): IColor {
  if (typeof shorthand === 'string') {
    const color: IColor = {}
    color[property] = shorthand
    return color
  }
  return shorthand as IColor
}

// Translate simplified color strings to full color object
export function fromObjectStrings (color: IColorScheme<ShorthandColor>): IColorScheme<IColor> {
  return {
    background: shorthandToColor(color.background, 'background-color'),
    contrast: shorthandToColor(color.contrast, 'background-color'),
    subtext: shorthandToColor(color.subtext, 'color'),
    text: shorthandToColor(color.text, 'color')
  }
}

export function fromColorLight (color: IColor): IColorScheme<IColor> {
  return fromObjectStrings({
    background: color,
    contrast: 'white',
    subtext: 'black',
    text: 'black'
  })
}

export function fromColorDark (color: IColor): IColorScheme<IColor> {
  return fromObjectStrings({
    background: 'black',
    contrast: '#444',
    subtext: 'white',
    text: color
  })
}
