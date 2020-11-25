import { toTypesPackageName } from '../util'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

export function loadUntypedPackages(): string[] {
  try {
    const pkgPath = resolve(process.cwd(), 'package.json')
    if (existsSync(pkgPath)) {
      const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const prodDeps = pkgJson.dependencies ?? {}
      const devDeps = pkgJson.devDependencies ?? {}
      const allDeps = Object.keys({ ...prodDeps, ...devDeps })
      return allDeps.filter(dep => {
        if (/^@types/i.test(dep)) return false
        if (allDeps.includes(toTypesPackageName(dep))) return false
        return true
      })
    }
  } catch (ex) {}
  return []
}
