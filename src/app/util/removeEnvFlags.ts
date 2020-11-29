import { ArgvilleParsedArguments } from 'argville'

export function removeEnvFlags(
  args: Record<string, any>,
): ArgvilleParsedArguments {
  const flagsToRemove = [
    'production',
    'saveProd',
    'saveDev',
    'savePeer',
    '--no-save',
    'E',
    'saveExact',
    'D',
    'dev',
    'P',
    'peer',
    'O',
    'optional',
  ]

  for (const flag of flagsToRemove) {
    // eslint-disable-next-line
    delete args[flag]
  }
  return args
}
