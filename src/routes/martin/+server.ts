import type { RequestHandler } from './$types'
import { fetchUrl } from '$lib/helper'
import type { TreeNode } from '$lib/types'

import fs from 'fs'
import path from 'path'
const __dirname = path.resolve()

export const GET: RequestHandler = async ({ url }) => {
  const catalogues = JSON.parse(fs.readFileSync(`${__dirname}/data/external-buckets.json`, 'utf8'))
  const startTime = performance.now()

  const containerLabel = url.searchParams.get('label')
  const containerPath = url.searchParams.get('path')

  // check whether it is root level
  const catalog: TreeNode = catalogues.find((catalog) => catalog.label === containerLabel)

  const indexData = await fetchUrl(`${containerPath}`)
  const children = []
  if (!catalog) {
    // table
    Object.keys(indexData).forEach((id) => {
      const table = indexData[id]
      if (table.schema === containerLabel) {
        let geomType: string
        switch (table.geometry_type.toLowerCase()) {
          case 'multipoint':
            geomType = 'point'
            break
          case 'multilinestring':
            geomType = 'line'
            break
          case 'multipolygon':
            geomType = 'polygon'
            break
        }
        const chjld: TreeNode = {
          label: table.table,
          path: table.id,
          geomType: geomType,
          url: `${url.origin}/martin/${table.id}/tile.json`,
          isRaster: false,
          isStac: false,
          dynamicSourceType: 'martin',
        }
        children.push(chjld)
      }
    })
  } else {
    // schema
    Object.keys(indexData).forEach((id) => {
      const table = indexData[id]
      let schema: TreeNode = children.find((s) => s.label === table.schema)
      if (!schema) {
        schema = {
          label: table.schema,
          path: containerPath,
          url: null,
          children: [],
          isRaster: false,
          isStac: false,
          dynamicSourceType: 'martin',
        }
        children.push(schema)
      }
    })
  }

  const tree: TreeNode = {
    label: containerLabel,
    path: containerPath,
    url: null,
    children: children,
    isRaster: false,
    isStac: false,
    dynamicSourceType: 'martin',
  }

  const endTime = performance.now()

  return new Response(
    JSON.stringify({
      tree,
      responseTime: endTime - startTime,
    }),
  )
}
