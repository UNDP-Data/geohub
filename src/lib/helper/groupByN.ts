export const groupByN = (n: number, data: never[]) => {
  const result = []
  for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n))
  return result
}
