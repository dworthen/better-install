import fetch from 'node-fetch'
import execa from 'execa'

export function isYarn(pm: string): boolean {
  return /yarn(?:\.js)?$/i.test(pm)
}

export function isPnpm(pm: string): boolean {
  return /pnpm(?:\.js)?$/i.test(pm)
}

export async function includesTypes(pkg: string): Promise<string> {
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

export async function npmPackageExists(pkg: string): Promise<string> {
  try {
    await execa('npm', ['view', pkg, 'version'])
    return pkg
  } catch (ex) {}
  return 'Not Found'
}
