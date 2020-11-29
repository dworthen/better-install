import { npmPackageExists, toTypesPackageName } from '../util'

export async function getTypesPackagesToInstall(
  packages: string[],
): Promise<string[]> {
  const typePackageNames = packages.map(toTypesPackageName)
  const typePackagesThatExist = typePackageNames.map(async pkg => {
    // eslint-disable-next-line
    return npmPackageExists(pkg)
  })
  return (await Promise.all(typePackagesThatExist)).reduce<string[]>(
    (acc, exists, ind) => {
      if (!exists) return acc
      acc.push(typePackageNames[ind])
      return acc
    },
    [],
  )
}
