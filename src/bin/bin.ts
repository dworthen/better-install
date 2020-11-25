import { loadArgs } from './loadArgs'
import debug from 'debug'
import { readFileSync } from 'fs'
import { getHelp } from './usage'
import { resolve } from 'path'
import { cliFlagOptions } from './options'
import { install, log } from '../app'

export async function run(argv: string[]): Promise<void> {
  const args = loadArgs(argv)

  if (args.verbose === true) {
    debug.enable('better-install')
  }

  if (args.help === true) {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../package.json'), 'utf-8'),
    )
    console.log(
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

  log('Args: %O', args)

  await install(args)
}
