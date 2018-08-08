type ShorthandColor = string | object
type Color = { [property: string]: string } // a CSS properties object

interface ColorScheme<T> {
  background: T, 
  text: T,
  subtext: T,
  contrast: T 
}

function shorthandToColor(shorthand: ShorthandColor, property: string): Color {
  if (typeof shorthand === 'string') {
    const color: Color = {}
    color[property] = <string> shorthand
    return color
  }
  return <Color> shorthand
}

// Translate simplified color strings to full color object
export function fromObjectStrings (color: ColorScheme<ShorthandColor>): ColorScheme<Color> {
  return {
    background: shorthandToColor(color.background, 'background-color'),
    text: shorthandToColor(color.text, 'color'),
    subtext: shorthandToColor(color.subtext, 'color'),
    contrast: shorthandToColor(color.contrast, 'background-color')
  }
}

export function fromColorLight (color: Color): ColorScheme<Color> {
  return fromObjectStrings({
    background: color,
    text: 'black',
    subtext: 'black',
    contrast: 'white'
  })
}

export function fromColorDark (color: Color): ColorScheme<Color> {
  return fromObjectStrings({
    background: 'black',
    text: color,
    subtext: 'white',
    contrast: '#444'
  })
}
