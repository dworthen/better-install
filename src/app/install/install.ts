import { ArgvilleParsedArguments } from 'argville'
import { loadTypesInfo, loadUntypedPackages } from '../typesInfo'
import { toArgArray } from '../util'
import { installDeps } from './installDeps'

export async function install(args: ArgvilleParsedArguments): Promise<void> {
  const pm: string = args.pm ?? ''
  const cmdArgs = toArgArray(args)
  const packages: string[] = args._

  const depInstallation = installDeps(pm, packages, cmdArgs)

  const packagesToCheck = packages.length > 0 ? packages : loadUntypedPackages()
  const packageTypesInfo = await loadTypesInfo(packagesToCheck)
  const typesPacakgesToInstall = packageTypesInfo.filter(
    pkg => pkg !== 'Included' && pkg !== 'Not Found',
  )

  let typesInstallation
  if (typesPacakgesToInstall.length > 0) {
    typesInstallation = installDeps(pm, typesPacakgesToInstall, ['-D'])
  }

  await Promise.all([depInstallation, typesInstallation])
}
