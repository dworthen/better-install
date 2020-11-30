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
import { getPackages } from '@manypkg/get-packages'
import { relative } from 'path'
import micromatch from 'micromatch'

export async function run(argv: string[]): Promise<void> {
  const args = loadArgs(argv)

  if (args.verbose === true) {
    logger.setLogLevel(logger.LOG_LEVEL.Debug)
  }

  if (args.colors === false) {
    logger.setColors(false)
  }

  if (args.filter == null) {
    args.filter = '*'
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

  const monoRepoInformation = await getPackages(process.cwd())

  logger.debug('Monorepo packages: %O', monoRepoInformation)

  const allPackages: any[] = [monoRepoInformation.root]

  monoRepoInformation.packages.forEach((pkgInfo: any) => {
    if (
      allPackages.findIndex(allPkgInfo => allPkgInfo.dir === pkgInfo.dir) === -1
    ) {
      allPackages.push(pkgInfo)
    }
  })

  for (const packageInfo of allPackages) {
    const dir = `${relative(process.cwd(), packageInfo.dir)}`.replace(
      /\\/g,
      '/',
    )
    const filter = args.filter.map((f: string) =>
      f.replace(/\\/g, '/').replace(/\/$/, ''),
    )
    logger.debug('Package directory: %s', dir)
    if (packages.length > 0) {
      const match =
        micromatch.isMatch(dir, filter) ||
        micromatch.isMatch(packageInfo.packageJson.name ?? '', filter)
      if (!match) {
        continue
      }
    }
    const installDepsCommand = getInstallCommand(pm, packages, pmArgsArray)

    logger.debug('Install command: %s', installDepsCommand)
    logger.info(
      '========================= %s =========================',
      packageInfo.packageJson.name ?? packageInfo.dir,
    )
    logger.info('Installing dependencies')
    await install(installDepsCommand, dir)

    const packagesToLoadTypes =
      packages.length > 0
        ? packages
        : getPackageJsonDependenciesWithoutTypes(packageInfo.packageJson)

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
      logger.debug('Install types command: %s', installTypesCommand)
      logger.debug('Package directory: %s', dir)
      logger.info('Installing @types %O', typePackagesToInstall)

      await install(installTypesCommand, dir)
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
}
