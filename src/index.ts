import { readFileSync, existsSync } from 'fs'
import { homedir, tmpdir } from 'os'
import { resolve } from 'path'
import ini from 'ini'
import execa from 'execa'
import debug from 'debug'
import { ArgOption, ArgvilleParsedArguments, parseAndValidate } from 'argville'
import fetch from 'node-fetch'
import cliui from 'cliui'

const log = debug('better-install')

const cliFlagOptions: Record<string, ArgOption & { description?: string }> = {
  pm: {
    type: 'string',
    map: arg => {
      if (arg != null && typeof arg === 'string') {
        return arg.toLowerCase()
      }
      return arg
    },
    expected: ['npm', 'yarn', 'pnpm'],
    description:
      'Select package manager. Defaults to npm or, if used as an npm script, ' +
      'the package manager that invokes the script',
  },

  verbose: {
    type: 'boolean',
    default: false,
    description: 'Print debug messages.',
  },

  help: {
    type: 'boolean',
    alias: 'h',
    default: false,
    description: 'Print help message.',
  },
}

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

function isYarn(pm: string): boolean {
  return /yarn(?:\.js)?$/i.test(pm)
}

function isPnpm(pm: string): boolean {
  return /pnpm(?:\.js)?$/i.test(pm)
}

function packageNameToTypesName(pkgName: string): string {
  return `@types/${pkgName.replace(/\//g, '__')}`
}

function toArgArray(args: ArgvilleParsedArguments): string[] {
  const ignore = ['_', 'pm', 'verbose', 'help']
  return Object.entries(args).reduce<string[]>((acc, [flag, value]) => {
    if (ignore.includes(flag)) return acc
    const prepend = flag.length === 1 ? '-' : '--'
    acc.push(prepend + flag)
    if (typeof value !== 'boolean') {
      if (Array.isArray(value)) {
        return [...acc, ...value]
      } else {
        return [...acc, value]
      }
    }
    return acc
  }, [])
}

async function includesTypes(pkg: string): Promise<string> {
  const [pkgJson, declarationStatus] = await Promise.all([
    fetch(`https://cdn.jsdelivr.net/npm/${pkg}/package.json`).then(res => {
      if (!res.ok) return {} as any
      return res.json()
    }),
    fetch(`https://cdn.jsdelivr.net/npm/${pkg}/index.d.ts`).then(
      res => res.status,
    ),
  ])

  if (pkgJson.types != null || pkgJson.typings != null) return 'Included'
  if (declarationStatus === 200) return 'Included'
  return pkg
}

async function npmPackageExists(pkg: string): Promise<string> {
  try {
    await execa('npm', ['view', pkg, 'version'])
    return pkg
  } catch (ex) {}
  return 'Not Found'
}

async function loadTypeInfo(packages: string[]): Promise<string[]> {
  const packagesWithTypes = packages.map(async pkg => {
    return await includesTypes(pkg)
  })
  const packagesWithRemoteTypes = (await Promise.all(packagesWithTypes)).map(
    pkg => {
      return pkg === 'Included'
        ? pkg
        : npmPackageExists(packageNameToTypesName(pkg))
    },
  )
  return await Promise.all(packagesWithRemoteTypes)
}

function loadNonTypePackages(): string[] {
  try {
    const pkgPath = resolve(process.cwd(), 'package.json')
    if (existsSync(pkgPath)) {
      const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const prodDeps = pkgJson.dependencies ?? {}
      const devDeps = pkgJson.devDependencies ?? {}
      const allDeps = Object.keys({ ...prodDeps, ...devDeps })
      return allDeps.filter(dep => {
        if (/^@types/i.test(dep)) return false
        if (allDeps.includes(packageNameToTypesName(dep))) return false
        return true
      })
    }
  } catch (ex) {}
  return []
}
async function installDeps(
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
async function install(args: ArgvilleParsedArguments): Promise<void> {
  const pm: string = args.pm ?? ''
  const cmdArgs = toArgArray(args)
  const packages: string[] = args._

  const depInstallation = installDeps(pm, packages, cmdArgs)

  const packagesToCheck = packages.length > 0 ? packages : loadNonTypePackages()
  const packageTypesInfo = await loadTypeInfo(packagesToCheck)
  const typesPacakgesToInstall = packageTypesInfo.filter(
    pkg => pkg !== 'Included' && pkg !== 'Not Found',
  )

  let typesInstallation
  if (typesPacakgesToInstall.length > 0) {
    console.log('Installing types: ')
    console.log(typesPacakgesToInstall.join('\n'))
    typesInstallation = installDeps(pm, typesPacakgesToInstall, ['-D'])
    console.log()
  }

  await Promise.all([depInstallation, typesInstallation])

  if (packageTypesInfo.includes('Included')) {
    console.log('Types are included with the following packages:')
    packageTypesInfo.forEach((_, ind) => {
      console.log(packagesToCheck[ind])
    })
  }

  if (packageTypesInfo.includes('Not Found')) {
    console.log('Could not find types for the following packages: ')
    packageTypesInfo.forEach((_, ind) => {
      console.log(packagesToCheck[ind])
    })
  }
}

interface GetHelpOptions {
  flagOptions: Record<string, ArgOption & { description?: string }>
  usage: string
  description: string
  name: string
  version: string
}
function getHelp({
  flagOptions,
  usage,
  description,
  name,
  version,
}: GetHelpOptions): string {
  const ui = cliui()

  ui.div(`\n${name}\n` + `Version: ${version}\n`)

  ui.div({
    text: description,
    padding: [0, 0, 1, 3],
  })

  ui.div('Usage:\n')

  ui.div({
    text: usage,
    padding: [0, 0, 1, 3],
  })

  const flags = Object.entries(flagOptions)

  if (flags.length > 0) {
    ui.div('Options:')
  }
  flags.forEach(([flag, options]) => {
    const flags = []
    const description = options.description ?? ''
    const lb = options.required === true ? '<' : '['
    const rb = options.required === true ? '>' : ']'
    const printValue = options.type !== 'boolean'
    const ellipses = options.multiple === true ? '...' : ''
    const value = printValue ? `${lb}${flag}${ellipses}${rb}` : ''
    const defaultValue =
      options.default != null ? `(default=${options.default as string})` : ''

    if (options.alias != null) {
      if (Array.isArray(options.alias)) {
        options.alias.forEach(alias => {
          flags.push(`-${alias}`)
        })
      } else {
        flags.push(`-${options.alias}`)
      }
    }

    flags.push(`--${flag}`)

    ui.div(
      {
        text: `${flags.join(', ')} ${value}`,
        width: 20,
        padding: [0, 0, 1, 0],
      },
      {
        text: description,
        padding: [0, 0, 1, 0],
      },
      {
        text: defaultValue,
        wdith: 20,
        padding: [0, 0, 1, 0],
      },
    )
  })

  ui.div('NOTE:\n')

  ui.div({
    text:
      `${name} passes unknown flags to the underlying package manager. ` +
      'For example, "bi lodash -D" will send the -D flag to the package manager and ' +
      'therfore install lodash and @types/lodash as devDependencies ' +
      '(@types are always installed as devDependencies).',
    padding: [0, 0, 1, 3],
  })

  return ui.toString()
}

function loadArgs(argv: string[]): ArgvilleParsedArguments {
  const args = parseAndValidate({ flags: cliFlagOptions }, argv.slice(2))

  return args
}

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

  if (args.pm == null) {
    setPackageManager(args)
  }

  log('Args: %O', args)

  await install(args)
}
