import findUp from 'find-up'
import { promises as fs } from 'fs'
export async function loadPackageJson(): Promise<Record<string, any>> {
  const packagePath = await findUp('package.json', {
    cwd: __dirname,
  })
  if (packagePath != null) {
    const packageJson: Record<string, any> = JSON.parse(
      await fs.readFile(packagePath, 'utf-8'),
    )
    return packageJson
  }
  return {}
}
