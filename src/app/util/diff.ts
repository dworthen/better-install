export function diff<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.reduce<T[]>((acc, cur) => {
    if (arr2.includes(cur)) return acc
    acc.push(cur)
    return acc
  }, [])
}
