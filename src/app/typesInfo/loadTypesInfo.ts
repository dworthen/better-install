import { includesTypes, npmPackageExists, toTypesPackageName } from '../util'

export async function loadTypesInfo(packages: string[]): Promise<string[]> {
  const packagesWithTypes = packages.map(async pkg => {
    return await includesTypes(pkg)
  })
  const packagesWithRemoteTypes = (await Promise.all(packagesWithTypes)).map(
    pkg => {
      return pkg === 'Included'
        ? pkg
        : npmPackageExists(toTypesPackageName(pkg))
    },
  )
  return await Promise.all(packagesWithRemoteTypes)
}
