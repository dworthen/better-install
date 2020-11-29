import { toTypesPackageName } from '../util'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

export function getPackageJsonDependenciesWithoutTypes(): string[] {
  try {
    const pkgPath = resolve(process.cwd(), 'package.json')
    if (existsSync(pkgPath)) {
      const pkgJson: Record<string, any> = JSON.parse(
        readFileSync(pkgPath, 'utf-8'),
      )
      const prodDeps = pkgJson.dependencies ?? {}
      const devDeps = pkgJson.devDependencies ?? {}
      const allDeps = Object.entries({ ...prodDeps, ...devDeps }).map(
        ([dep, version]) => {
          return dep + '@' + (version as string)
        },
      )
      return allDeps.filter(dep => {
        if (/^@types/i.test(dep)) return false
        if (
          allDeps.find(val => val.startsWith(toTypesPackageName(dep))) !==
          undefined
        ) {
          return false
        }
        return true
      })
    }
  } catch (ex) {}
  return []
}
