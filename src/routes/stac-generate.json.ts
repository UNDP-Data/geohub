import fs from 'fs'
import path from 'path'

import { fetchUrl } from '$lib/helper'
import type { Bucket, TreeNode } from '$lib/types'

const __dirname = path.resolve()

export async function get() {
  const startTime = performance.now()

  const filePath = `${__dirname}/data/stac.json`
  const stacBuckets = []

  const COG_MIME_TYPE = 'image/tiff; application=geotiff; profile=cloud-optimized'

  // some collection from microsoft planetary computer STAC has a bad data source.
  // if the name is added in this list, the API will create stac-msft.json without those collection
  const IGNORE_COLLECTION_LIST = [
    'modis',
    'planet-nicfi',
    'jrc-gsw',
    'cop-dem-glo-90',
    'cop-dem-glo-30',
    'gnatsgo-rasters',
    'alos-fnf-mosaic',
  ]

  if (fs.existsSync(filePath)) {
    const catalogues = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Bucket[]

    for (const catalog of catalogues) {
      // fetch catalog url
      const node: TreeNode = {
        label: catalog.label,
        path: `${catalog.id}/`,
        url: null,
        isRaster: true,
        isStac: true,
        children: [],
      }

      // filter collections with COG / child items
      const data = await fetchUrl(catalog.url)
      const collectionsWithCog = data.collections.filter((collection) => {
        if (Object.prototype.hasOwnProperty.call(collection, 'item_assets')) {
          for (const itemAssetType of Object.keys(collection.item_assets)) {
            // check for COG
            if (collection.item_assets[itemAssetType].type === COG_MIME_TYPE) {
              return true
            }
          }
        }

        return false
      })

      const collections = []

      for (const cog of collectionsWithCog) {
        const isIgnore = IGNORE_COLLECTION_LIST.find(
          (collectionName) => cog.id.toLowerCase().indexOf(collectionName) !== -1,
        )
        if (isIgnore) continue
        const collection: TreeNode = {
          id: cog.id,
          label: cog.title,
          path: `${catalog.id}/${cog.id}/`,
          url: null,
          isRaster: true,
          isStac: true,
          children: [],
        }

        collections.push(collection)
      }

      node.children = collections
      stacBuckets.push(node)

      fs.writeFileSync(`${__dirname}/data/stac-${catalog.id}.json`, JSON.stringify(node, null, 2))
    }
  }

  const endTime = performance.now()

  return {
    body: {
      tree: stacBuckets,
      responseTime: endTime - startTime,
    },
  }
}
