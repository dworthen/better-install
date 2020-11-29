import { loadArgs } from './loadArgs'
import { cliFlagOptions } from './options'
import {
  install,
  loadPackageJson,
  toArgArray,
  toTypesPackageName,
  getPackagesNotBundledWithTypes,
  getPackageJsonDependenciesWithoutTypes,
  getTypesPackagesToInstall,
  removeBiArgs,
  getInstallCommand,
  diff,
} from '../app'
import * as logger from '../app/logger'
import { removeEnvFlags } from '../app/util/removeEnvFlags'

export async function run(argv: string[]): Promise<void> {
  const args = loadArgs(argv)

  if (args.verbose === true) {
    logger.setLogLevel(logger.LOG_LEVEL.Debug)
  }

  if (args.colors === false) {
    logger.setColors(false)
  }

  if (args.help === true) {
    const packageJson = await loadPackageJson()
    logger.printHelp({
      packageInfo: packageJson,
      flagOptions: cliFlagOptions,
      usage: ['bi [packages...] [options]'],
    })
    process.exit(1)
  }

  logger.debug('CLI Args: %O', args)

  const pm = args.pm
  const packages = args._
  const pmArgs = removeBiArgs(
    Object.assign({}, args),
    Object.keys(cliFlagOptions),
  )
  const pmArgsArray = toArgArray(pmArgs)

  logger.debug('Package manager: %s', pm)
  logger.debug('Package manager args: %O', pmArgsArray)
  logger.log('')

  const installDepsCommand = getInstallCommand(pm, packages, pmArgsArray)
  if (packages.length > 0) {
    logger.info('Installing dependencies %O', packages)
  } else {
    logger.info('Installing dependencies.')
  }

  logger.debug('Install command: %s', installDepsCommand)

  await install(installDepsCommand)

  const packagesToLoadTypes =
    packages.length > 0 ? packages : getPackageJsonDependenciesWithoutTypes()

  logger.debug('Packages that may need types: %O', packagesToLoadTypes)

  const packagesNotBundledWithTypes = await getPackagesNotBundledWithTypes(
    packagesToLoadTypes,
  )

  logger.debug(
    'Packages not bundled with types: %O',
    packagesNotBundledWithTypes,
  )

  const typePackagesToInstall = await getTypesPackagesToInstall(
    packagesNotBundledWithTypes,
  )

  logger.debug(
    'Additional @types packages to install: %O',
    typePackagesToInstall,
  )

  const typesCommandFlags = [...toArgArray(removeEnvFlags(pmArgs)), '-D']
  const installTypesCommand = getInstallCommand(
    pm,
    typePackagesToInstall,
    typesCommandFlags,
  )

  if (typePackagesToInstall.length > 0) {
    logger.info('Installing @types %O', typePackagesToInstall)
    logger.debug('Install types command: %s', installTypesCommand)

    await install(installTypesCommand)
  } else {
    logger.info('No additional @types packages to install.')
  }

  const packagesBundledWithTypes = diff(
    packagesToLoadTypes,
    packagesNotBundledWithTypes,
  )
  if (packagesBundledWithTypes.length > 0) {
    logger.info('Packages bundled with types: %O', packagesBundledWithTypes)
    logger.log('')
  }

  if (typePackagesToInstall.length > 0) {
    logger.info(
      'Additional @types packages installed: %O',
      typePackagesToInstall,
    )
    logger.log('')
  }

  const packagesWithoutTypes = diff(
    packagesNotBundledWithTypes.map(toTypesPackageName),
    typePackagesToInstall,
  )
  if (packagesWithoutTypes.length > 0) {
    logger.info('Packages without any types: %O', packagesWithoutTypes)
  }
}
