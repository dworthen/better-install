import { ArgvilleParsedArguments } from 'argville'

export function removeBiArgs(
  args: ArgvilleParsedArguments,
  optionsToDelete: string[],
): ArgvilleParsedArguments {
  delete args._
  for (const flag of optionsToDelete) {
    // eslint-disable-next-line
    delete args[flag]
  }
  return args
}
