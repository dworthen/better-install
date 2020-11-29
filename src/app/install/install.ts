import execa from 'execa'

export async function install(
  command: string,
  cwd: string = process.cwd(),
): Promise<execa.ExecaChildProcess<string>> {
  const cmd = execa.command(command, {
    localDir: cwd,
  })
  cmd.stdout?.pipe(process.stdout)
  cmd.stderr?.pipe(process.stderr)

  return await cmd
}
