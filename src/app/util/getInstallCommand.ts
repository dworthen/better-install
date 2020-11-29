import { isPnpm, isYarn } from '../util'

export function getInstallCommand(
  pm: string,
  packages: string[],
  cmdArgs: string[],
): string {
  if (packages.length > 0 && (isYarn(pm) || isPnpm(pm))) {
    cmdArgs.unshift('add')
  } else {
    cmdArgs.unshift('install')
  }

  return [pm, ...cmdArgs, ...packages].join(' ')
}
