import type { RequestHandler } from './$types'
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

export const GET: RequestHandler = async () => {
  const startTime = performance.now()

  const filePath = `${__dirname}/data/tags.json`
  let tags = {}

  if (fs.existsSync(filePath)) {
    tags = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  const endTime = performance.now()

  return new Response(
    JSON.stringify({
      tags,
      responseTime: endTime - startTime,
    }),
  )
}
