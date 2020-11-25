import { readFileSync, existsSync } from 'fs'
import { homedir, tmpdir } from 'os'
import { resolve } from 'path'
import ini from 'ini'
import execa from 'execa'
import debug from 'debug'
import { ArgOption, ArgvilleParsedArguments, parseAndValidate } from 'argville'
import fetch from 'node-fetch'

const log = debug('better-install')

const cliFlagOptions: Record<string, ArgOption> = {
  pm: {
    type: 'string',
    map: (arg) => {
      if (arg && typeof arg === 'string') {
        return arg.toLowerCase()
      }
      return arg
    },
    expected: ['npm', 'yarn', 'pnpm'],
  },

  verbose: {
    type: 'boolean',
    default: false,
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
  if (process.env.npm_execpath) {
    args.pm = process.env.npm_execpath
    return
  }

  const localNpmrc = loadNpmrc(process.cwd())

  if (localNpmrc && localNpmrc.pm) {
    args.pm = localNpmrc.pm
    return
  }

  const userNpmrc = loadNpmrc(homedir() || tmpdir())

  if (userNpmrc && userNpmrc.pm) {
    args.pm = userNpmrc.pm
    return
  }

  args.pm = 'npm'
}

function isYarn(pm: string) {
  return /yarn(?:\.js)?$/i.test(pm)
}

function isPnpm(pm: string) {
  return /pnpm(?:\.js)?$/i.test(pm)
}

function packageNameToTypesName(pkgName: string): string {
  return `@types/${pkgName.replace(/\//g, '__')}`
}

function toArgArray(args: ArgvilleParsedArguments): string[] {
  const ignore = ['_', 'pm', 'verbose']
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
    fetch(`https://cdn.jsdelivr.net/npm/${pkg}/package.json`).then((res) => {
      if (!res.ok) return {} as any
      return res.json()
    }),
    fetch(`https://cdn.jsdelivr.net/npm/${pkg}/index.d.ts`).then(
      (res) => res.status,
    ),
  ])

  if (pkgJson.types || pkgJson.typings) return 'Included'
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
  const packagesWithTypes = packages.map(async (pkg) => {
    return includesTypes(pkg)
  })
  const packagesWithRemoteTypes = (await Promise.all(packagesWithTypes)).map(
    (pkg) => {
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
      const prodDeps = pkgJson.dependencies || {}
      const devDeps = pkgJson.devDependencies || {}
      const allDeps = Object.keys({ ...prodDeps, ...devDeps })
      return allDeps.filter((dep) => {
        if (/^@types/i.test(dep)) return false
        if (allDeps.includes(packageNameToTypesName(dep))) return false
        return true
      })
    }
  } catch (ex) {}
  return []
}
async function installDeps(pm: string, packages: string[], cmdArgs: string[]) {
  if (packages.length && (isYarn(pm) || isPnpm(pm))) {
    cmdArgs.unshift('add')
  } else {
    cmdArgs.unshift('install')
  }

  const allCmdArgs = [...cmdArgs, ...packages]

  log(`Installing packages: %s %s`, pm, allCmdArgs.join(' '))

  const cmd = execa(pm, allCmdArgs)
  cmd.stdout?.pipe(process.stdout)
  cmd.stderr?.pipe(process.stderr)

  return cmd
}
async function install(args: ArgvilleParsedArguments) {
  const pm: string = args.pm! as string
  const cmdArgs = toArgArray(args)
  const packages: string[] = args._

  const depInstallation = installDeps(pm, packages, cmdArgs)

  const packagesToCheck = packages.length ? packages : loadNonTypePackages()
  const packageTypesInfo = await loadTypeInfo(packagesToCheck)
  const typesPacakgesToInstall = packageTypesInfo.filter(
    (pkg) => pkg !== 'Included' && pkg !== 'Not Found',
  )

  let typesInstallation
  if (typesPacakgesToInstall.length) {
    console.log(`Installing types: `)
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

function loadArgs(argv: string[]): ArgvilleParsedArguments {
  const args = parseAndValidate({ flags: cliFlagOptions }, argv.slice(2))

  if (args.verbose) {
    debug.enable('better-install')
  }

  if (!args.pm) {
    setPackageManager(args)
  }

  return args
}

export async function run(argv: string[]) {
  const args = loadArgs(argv)
  log('Args: %O', args)

  await install(args)
}
