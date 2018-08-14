export default interface ICookieManager {
  keys: string[]
  initialized: boolean
  initialize (): Promise<void>
  get (key: string, defaultValue?: any): any
  set (key: string, value: any): Promise<void>
  remove (key: string): Promise<any>
  clear (): Promise<void>
  getAll (): { [key: string]: any }
}
