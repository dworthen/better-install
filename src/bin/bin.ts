import { loadArgs } from './loadArgs'
import { cliFlagOptions } from './options'
import { install, loadPackageJson } from '../app'
import * as logger from '../app/logger'
import { printHelp } from '../app/logger/printHelp'

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
    printHelp({
      packageInfo: packageJson,
      flagOptions: cliFlagOptions,
      usage: ['bi [packages...] [options]'],
    })
    process.exit(1)
  }

  logger.debug('CLI Args: %O', args)

  await install(args)
}
