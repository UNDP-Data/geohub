import fs from 'fs'
import path from 'path'

import type { TreeNode } from '$lib/types'

const __dirname = path.resolve()

export async function get() {
  const startTime = performance.now()

  const files = fs.readdirSync(`${__dirname}/data/`)
  const tree = []

  for (const file of files) {
    if (file.startsWith('stac-')) {
      const stacFile = `${__dirname}/data/${file}`
      const stacData = JSON.parse(fs.readFileSync(stacFile, 'utf8')) as TreeNode[]
      tree.push(stacData)
    }
  }

  const endTime = performance.now()

  return {
    body: {
      tree,
      responseTime: endTime - startTime,
    },
  }
}
