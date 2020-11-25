import { isPnpm, isYarn, log } from '../util'
import execa from 'execa'

export async function installDeps(
  pm: string,
  packages: string[],
  cmdArgs: string[],
): Promise<execa.ExecaChildProcess<string>> {
  if (packages.length > 0 && (isYarn(pm) || isPnpm(pm))) {
    cmdArgs.unshift('add')
  } else {
    cmdArgs.unshift('install')
  }

  const allCmdArgs = [...cmdArgs, ...packages]

  log('Installing packages: %s %s', pm, allCmdArgs.join(' '))

  const cmd = execa(pm, allCmdArgs)
  cmd.stdout?.pipe(process.stdout)
  cmd.stderr?.pipe(process.stderr)

  return await cmd
}
