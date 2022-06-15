import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

export async function get() {
  const tags = fs.readFileSync(`${__dirname}/static/tags.json`)

  return {
    body: tags
  }
}
