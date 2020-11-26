import { ArgvilleParsedArguments } from 'argville'

export function toArgArray(args: ArgvilleParsedArguments): string[] {
  const ignore = ['_', 'pm', 'verbose', 'help', 'colors']
  return Object.entries(args).reduce<string[]>((acc, [flag, value]) => {
    if (ignore.includes(flag)) return acc
    const prepend = flag.length === 1 ? '-' : '--'
    acc.push(prepend + flag)
    if (typeof value !== 'boolean') {
      if (Array.isArray(value)) {
        return [...acc, ...value]
      } else {
        return [...acc, value]
      }
    }
    return acc
  }, [])
}
