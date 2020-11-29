import { includesTypes } from '../util'

export async function getPackagesNotBundledWithTypes(
  packages: string[],
): Promise<string[]> {
  const packagesWithTypes = packages.map(async pkg => {
    // eslint-disable-next-line
    return includesTypes(pkg)
  })
  return (await Promise.all(packagesWithTypes)).reduce<string[]>(
    (acc, included, ind) => {
      if (included) return acc
      acc.push(packages[ind])
      return acc
    },
    [],
  )
}
