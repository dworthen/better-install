import { ArgOption } from 'argville'
import cliui from 'cliui'

export interface GetHelpOptions {
  flagOptions: Record<string, ArgOption & { description?: string }>
  usage: string[]
  description: string
  name: string
  version: string
}
export function getHelp({
  flagOptions,
  usage,
  description,
  name,
  version,
}: GetHelpOptions): string {
  const ui = cliui()

  ui.div(`\n${name}\n` + `Version: ${version}\n`)

  ui.div({
    text: description,
    padding: [0, 0, 1, 3],
  })

  ui.div('Usage:\n')

  usage.forEach(use => {
    ui.div({
      text: usage,
      padding: [0, 0, 1, 3],
    })
  })

  const flags = Object.entries(flagOptions)

  if (flags.length > 0) {
    ui.div('Options:')
  }
  flags.forEach(([flag, options]) => {
    const flags = []
    const description = options.description ?? ''
    const lb = options.required === true ? '<' : '['
    const rb = options.required === true ? '>' : ']'
    const printValue = options.type !== 'boolean'
    const ellipses = options.multiple === true ? '...' : ''
    const value = printValue ? `${lb}${flag}${ellipses}${rb}` : ''
    const defaultValue =
      options.default != null ? `(default=${options.default as string})` : ''

    if (options.alias != null) {
      if (Array.isArray(options.alias)) {
        options.alias.forEach(alias => {
          flags.push(`-${alias}`)
        })
      } else {
        flags.push(`-${options.alias}`)
      }
    }

    flags.push(`--${flag}`)

    ui.div(
      {
        text: `${flags.join(', ')} ${value}`,
        width: 20,
        padding: [0, 0, 1, 0],
      },
      {
        text: description,
        padding: [0, 1, 1, 0],
      },
      {
        text: defaultValue,
        wdith: 20,
        padding: [0, 0, 1, 0],
      },
    )
  })

  ui.div('NOTE:\n')

  ui.div({
    text:
      `${name} passes unknown flags to the underlying package manager. ` +
      'For example, "bi lodash -D" sends the -D flag to the package manager and ' +
      'therfore installs lodash and @types/lodash as devDependencies ' +
      '(@types are always installed as devDependencies).',
    padding: [0, 0, 1, 3],
  })

  return ui.toString()
}
