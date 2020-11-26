import { ArgOption } from 'argville'
import { getHelp } from '../../bin/usage'
import { log } from './logger'

interface PrintHelpOptions {
  usage: string[]
  packageInfo: Record<string, any>
  flagOptions: Record<string, ArgOption>
}
export function printHelp({
  packageInfo,
  flagOptions,
  usage,
}: PrintHelpOptions): void {
  log(
    getHelp({
      flagOptions,
      usage,
      description: packageInfo.description,
      name: packageInfo.name,
      version: packageInfo.version,
    }),
  )
}
