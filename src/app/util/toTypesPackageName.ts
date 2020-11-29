export function toTypesPackageName(pkgName: string): string {
  const typesName = pkgName
    .replace(/^@/, '')
    .replace(/@.*/, '')
    .replace(/\//g, '__')
  return `@types/${typesName}`
}
