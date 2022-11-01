import type { RequestHandler } from './$types'
import { fetchUrl } from '$lib/helper'
import type { PgtileservDetailJson, PgtileservIndexJson, TreeNode } from '$lib/types'
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

  const indexData: PgtileservIndexJson = await fetchUrl(`${containerPath}`)
  const children = []
  if (!catalog) {
    // table or function
    const tableList = Object.keys(indexData)
    for (let i = 0; i < tableList.length; i++) {
      const tableSchemaName = tableList[i]
      const indexJson = indexData[tableSchemaName]
      if (indexJson.type !== 'table') continue
      const [schema, table] = tableSchemaName.split('.')
      const detailJsonUrl = `${new URL(containerPath).origin}/${tableSchemaName}.json`
      const detailJson: PgtileservDetailJson = await fetchUrl(detailJsonUrl)

      if (schema === containerLabel) {
        let geomType: string
        switch (detailJson.geometrytype.toLocaleLowerCase()) {
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
          label: table,
          path: tableSchemaName,
          geomType: geomType,
          url: `${url.origin}/pgtileserv/table/${tableSchemaName}/tile.json`,
          isRaster: false,
          isStac: false,
          dynamicSourceType: 'pgtileserv',
        }
        children.push(chjld)
      }
    }
  } else {
    // schema
    Object.keys(indexData).forEach((id) => {
      const [schema, table] = id.split('.')
      let schemaNode: TreeNode = children.find((s) => s.label === schema)
      if (!schemaNode) {
        schemaNode = {
          label: schema,
          path: containerPath,
          url: null,
          children: [],
          isRaster: false,
          isStac: false,
          dynamicSourceType: 'pgtileserv',
        }
        children.push(schemaNode)
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
    dynamicSourceType: 'pgtileserv',
  }

  const endTime = performance.now()

  return new Response(
    JSON.stringify({
      tree,
      responseTime: endTime - startTime,
    }),
  )
}
