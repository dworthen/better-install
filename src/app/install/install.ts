import { ArgvilleParsedArguments } from 'argville'
import { loadTypesInfo, loadUntypedPackages } from '../typesInfo'
import { toArgArray } from '../util'
import { installDeps } from './installDeps'
import { log } from '../logger'

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
    log('Installing types: ')
    log(typesPacakgesToInstall.join('\n'))
    typesInstallation = installDeps(pm, typesPacakgesToInstall, ['-D'])
    log('')
  }

  await Promise.all([depInstallation, typesInstallation])

  if (packageTypesInfo.includes('Included')) {
    log('Types are included with the following packages:')
    packageTypesInfo.forEach((val, ind) => {
      if (val === 'Included') {
        log(packagesToCheck[ind])
      }
    })
  }

  if (packageTypesInfo.includes('Not Found')) {
    log('Could not find types for the following packages: ')
    packageTypesInfo.forEach((val, ind) => {
      if (val === 'Not Found') {
        log(packagesToCheck[ind])
      }
    })
  }
}
