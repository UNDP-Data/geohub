import fs from 'fs'
import path from 'path'

import type { TreeNode } from '$lib/types'

const __dirname = path.resolve()

export async function get({ url }) {
  const startTime = performance.now()

  const files = fs.readdirSync(`${__dirname}/data/`)
  let tree = []

  const stacIds = JSON.parse(fs.readFileSync(`${__dirname}/data/stac.json`, 'utf8')).map((catalog) => catalog.id)
  const paramId = url.searchParams.get('id')

  if (paramId && stacIds.includes(paramId)) {
    tree = getStacFileData(`stac-${paramId}.json`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    tree.children = tree.children.sort((a, b) => a.label.localeCompare(b.label))
  } else {
    for (const file of files) {
      if (file.startsWith('stac-')) {
        tree.push(getStacFileData(file))
      }
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

const getStacFileData = (file: string) => {
  const stacFile = `${__dirname}/data/${file}`
  return JSON.parse(fs.readFileSync(stacFile, 'utf8')) as TreeNode[]
}
