import { loadArgs } from './loadArgs'
import { readFileSync } from 'fs'
import { getHelp } from './usage'
import { resolve } from 'path'
import { cliFlagOptions } from './options'
import { install } from '../app'
import * as logger from '../app/logger'

export async function run(argv: string[]): Promise<void> {
  const args = loadArgs(argv)

  if (args.verbose === true) {
    logger.setLogLevel(logger.LOG_LEVEL.Debug)
  }

  if (args.colors === false) {
    logger.setColors(false)
  }

  if (args.help === true) {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../package.json'), 'utf-8'),
    )
    logger.log(
      getHelp({
        flagOptions: cliFlagOptions,
        usage: `${packageJson.name as string} [packages...] [options]`,
        description:
          'Automatically install TypeScript @types when adding/installing dependencies',
        name: packageJson.name,
        version: packageJson.version,
      }),
    )
    process.exit(1)
  }

  logger.info('Args: %O', args)

  await install(args)
}
