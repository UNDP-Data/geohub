import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'

import { fetchUrl } from '$lib/helper'

const __dirname = path.resolve()

export async function get({ url }) {
  const startTime = performance.now()
  const filePath = `${__dirname}/data/tags.json`
  const cache = []

  if (fs.existsSync(filePath)) {
    const nodeCache = new NodeCache()

    const tags = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    for (const tag of tags) {
      nodeCache.del(tag)
      const tagSearch = await fetchUrl(`${url.origin}/tags-search.json?tags=${tag}`)
      cache.push({
        tag: tagSearch.tags[0],
        responseTime: tagSearch.responseTime,
      })
    }
  }

  const endTime = performance.now()

  return {
    body: {
      cache,
      responseTime: endTime - startTime,
    },
  }
}
