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
    alias: 'f',
    multiple: true,
    default: '*',
    description:
      'Restrict package installation to a subset of packages ' +
      'within a monorepo project. Supports yarn and pnpm workspaces. ' +
      'Expects a single glob pattern or list of glob patterns and ' +
      'supports globbing against package names or package directories.',
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
