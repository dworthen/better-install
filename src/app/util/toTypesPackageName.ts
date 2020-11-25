export function toTypesPackageName(pkgName: string): string {
  return `@types/${pkgName.replace(/\//g, '__')}`
}
