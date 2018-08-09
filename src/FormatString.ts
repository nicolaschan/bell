export type Bindings = { [key: string]: string }

export default function (str: string, bindings: Bindings): string {
  let parts = str.split('{').map(a => a.split('}')).reduce((a, b) => a.concat(b))
  for (let i = 1; i < parts.length; i += 2) { parts[i] = bindings[parts[i]] || parts[i] }
  return parts.reduce((a, b) => a.concat(b))
}
