import { ArgvilleParsedArguments, parseAndValidate } from 'argville'
import { cliFlagOptions } from './options'
import { homedir, tmpdir } from 'os'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import ini from 'ini'

function loadNpmrc(dirPath: string): Record<string, any> | null {
  const fullPath = resolve(dirPath, '.npmrc')
  if (existsSync(fullPath)) {
    return ini.parse(readFileSync(fullPath, 'utf-8'))
  } else {
    return null
  }
}

function setPackageManager(args: ArgvilleParsedArguments): void {
  if (process.env.npm_execpath != null) {
    args.pm = process.env.npm_execpath
    return
  }

  const localNpmrc = loadNpmrc(process.cwd())

  if (localNpmrc?.pm != null) {
    args.pm = localNpmrc.pm
    return
  }

  const userNpmrc = loadNpmrc(homedir() ?? tmpdir())

  if (userNpmrc?.pm != null) {
    args.pm = userNpmrc.pm
    return
  }

  args.pm = 'npm'
}

export function loadArgs(argv: string[]): ArgvilleParsedArguments {
  const args = parseAndValidate({ flags: cliFlagOptions }, argv.slice(2))

  if (args.pm == null) {
    setPackageManager(args)
  }

  return args
}
