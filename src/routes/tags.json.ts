import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

export async function get() {
  const filePath = `${__dirname}/data/tags.json`
  let tags = {}

  if (fs.existsSync(filePath)) {
    tags = fs.readFileSync(filePath)
  }

  return {
    body: tags,
  }
}
