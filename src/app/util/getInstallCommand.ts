import { isPnpm, isYarn } from '../util'

export function getInstallCommand(
  pm: string,
  packages: string[],
  cmdArgs: string[],
): string {
  const args = [...cmdArgs]
  if (packages.length > 0 && (isYarn(pm) || isPnpm(pm))) {
    args.unshift('add')
  } else {
    args.unshift('install')
  }

  return [pm.replace(/\s/g, '\\ '), ...args, ...packages].join(' ')
}
