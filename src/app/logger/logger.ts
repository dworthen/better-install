import chalk from 'chalk'
import { formatWithOptions } from 'util'

export enum LOG_LEVEL {
  Silent = 0,
  Log,
  Error,
  Warn,
  Info,
  Debug,
}

const formatMap = new Map<number, chalk.Chalk>([
  [0, chalk.reset],
  [1, chalk.reset],
  [2, chalk.red.bold.bgBlack],
  [3, chalk.yellow.bgBlack],
  [4, chalk.green.bgBlack],
  [5, chalk.blue.bgBlack],
])

let logLevel: LOG_LEVEL = LOG_LEVEL.Info
let colors = true
const colorSupport = chalk.level

export function setLogLevel(level: LOG_LEVEL): void {
  logLevel = level
}

export function setColors(useColors: boolean): void {
  colors = useColors
}

function _printer(
  level: LOG_LEVEL,
  printer: (message: string, ...args: any[]) => void,
): (message: string, ...args: any[]) => void {
  const prepend = level === LOG_LEVEL.Log ? '' : `${LOG_LEVEL[level]}: `
  return function print(message: string, ...args: any[]) {
    if (logLevel >= level) {
      chalk.level = colors ? colorSupport : 0
      const format = formatMap.get(level) ?? chalk.reset
      const msg = (prepend + message)
        .replace(/\{/g, '_-_[')
        .replace(/\}/g, ']_-_')
      const expanded = formatWithOptions({ colors: colors }, msg, ...args)
        .replace(/\\/g, '\\\\')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/_-_\[/g, '{')
        .replace(/\]_-_/g, '}')
      printer(format(Object.assign([], { raw: [expanded] })))
    }
  }
}

export const log = _printer(LOG_LEVEL.Log, console.log)
export const error = _printer(LOG_LEVEL.Error, console.error)
export const warn = _printer(LOG_LEVEL.Warn, console.warn)
export const info = _printer(LOG_LEVEL.Info, console.info)
export const debug = _printer(LOG_LEVEL.Debug, console.debug)
