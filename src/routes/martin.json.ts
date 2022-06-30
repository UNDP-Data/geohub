import fs from 'fs'

import { fetchUrl } from '$lib/helper'
import type { TreeNode } from '$lib/types'

export async function get({ url }) {
  const startTime = performance.now()

  const containerLabel = url.searchParams.get('label')
  const containerPath = url.searchParams.get('path')

  const indexData = await fetchUrl(`${containerPath}`)
  const schemas = []
  Object.keys(indexData).forEach((id) => {
    const table = indexData[id]
    let schema: TreeNode = schemas.find((s) => s.label === table.schema)
    if (!schema) {
      schema = {
        label: table.schema,
        path: table.schema,
        url: null,
        children: [],
        isRaster: false,
        isStac: false,
        isMartin: true,
      }
      schemas.push(schema)
    }

    const layer: TreeNode = {
      label: table.table,
      path: table.table,
      url: `${containerPath.replace('index', table.id)}`,
      isRaster: false,
      isStac: false,
      isMartin: true,
    }
    schema.children.push(layer)
  })
  const tree: TreeNode = {
    label: containerLabel,
    path: containerPath,
    url: null,
    children: schemas,
    isRaster: false,
    isStac: false,
    isMartin: true,
  }

  const endTime = performance.now()

  return {
    body: {
      tree,
      responseTime: endTime - startTime,
    },
  }
}
