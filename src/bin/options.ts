import { ArgOption } from 'argville'

export const cliFlagOptions: Record<
  string,
  ArgOption & { description?: string }
> = {
  pm: {
    type: 'string',
    map: arg => {
      if (arg != null && typeof arg === 'string') {
        return arg.toLowerCase()
      }
      return arg
    },
    expected: ['npm', 'yarn', 'pnpm'],
    description:
      'Select package manager. Defaults to npm or, if used as an npm script, ' +
      'the package manager that invokes the script',
  },

  filter: {
    type: 'string',
    multiple: true,
    default: '*',
    description:
      'A list of glob patterns to filter for in a monorepo project. ',
  },

  verbose: {
    type: 'boolean',
    default: false,
    description: 'Print debug messages.',
  },

  help: {
    type: 'boolean',
    alias: 'h',
    default: false,
    description: 'Print help message.',
  },

  colors: {
    type: 'boolean',
    default: true,
    description:
      'Prints colors to stdin and stderr. use --no-colors to disable.',
  },
}
