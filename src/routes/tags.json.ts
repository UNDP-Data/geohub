import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

export async function get() {
  const startTime = performance.now()

  const filePath = `${__dirname}/data/tags.json`
  let tags = {}

  if (fs.existsSync(filePath)) {
    tags = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  const endTime = performance.now()

  return {
    body: {
      tags,
      responseTime: endTime - startTime,
    },
  }
}
