const getTimestamp = () => {
  return new Date().toTimeString().substring(0, 8)
}

export default class Logger {
  public log (message: string, prefix: string, color: string) {
    console.log(`%c${getTimestamp()} %c${prefix}%c: %c${message}`,
      'color:gray;', `color:${color};font-weight:600;`,
      'color:#aaa;', 'color:black;')
  }

  public trace (message: string) {
    this.log(message, 'TRACE', 'cyan')
  }

  public debug (message: string) {
    this.log(message, 'DEBUG', 'gray')
  }

  public success (message: string) {
    this.log(message, 'SUCCESS', 'green')
  }

  public info (message: string) {
    this.log(message, 'INFO', 'blue')
  }

  public warn (message: string) {
    console.warn(message)
  }

  public error (message: string) {
    console.error(message)
  }
}
