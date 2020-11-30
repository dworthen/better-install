import { toTypesPackageName } from '../util'

export function getPackageJsonDependenciesWithoutTypes(
  pkgJson: Record<string, any>,
): string[] {
  try {
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
  } catch (ex) {}
  return []
}
