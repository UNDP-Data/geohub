import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import fs from 'fs'
import type { StacCollection, StacItemFeatureCollection, TreeNode } from '$lib/types'

import path from 'path'
const __dirname = path.resolve()

export const GET: RequestHandler = async ({ url }) => {
  const catalogues = JSON.parse(fs.readFileSync(`${__dirname}/data/external-buckets.json`, 'utf8'))
  const catalogIds = url.searchParams.get('id')
  const containerPath = url.searchParams.get('path')

  // because of limitation of URL length, set 50 as limit of COGs
  const LIMIT = 50

  const catalogId = catalogIds.split('_')[0]
  const collectionId = catalogIds.split('_')[1]

  let catalog: TreeNode = catalogues.find((catalog) => catalog.id === catalogId)
  if (!catalog) {
    throw error(400, { message: `${catalogId} is invalid` })
  }

  const baseUrl = `${catalog.url}${catalog.path}`
  if (catalog.path === containerPath) {
    // /api/stac/v1/collections
    const collections = await getCollections(baseUrl)
    catalog.children = []
    collections.forEach((collection) => {
      catalog.children.push({
        id: `${catalog.id}_${collection.id}`,
        label: collection.title,
        path: `collection_${collection.id}`,
        url: undefined,
        isRaster: true,
        isStac: true,
        isMosaicJSON: true,
        children: [],
      })
    })
  } else if (containerPath.toLowerCase().indexOf('collection') > -1) {
    // /api/stac/v1/collections/{collection_id}/items?limit=1
    const apiUrl = `${baseUrl}/${collectionId}/items?limit=1`
    const fc = await getItem(apiUrl)
    const collectionUrl = fc.links.find((link) => link.rel === 'self').href
    const rootUrl = fc.links.find((link) => link.rel === 'root').href
    const collection = await getCollection(collectionUrl)
    catalog = {
      id: `${catalog.id}_${collectionId}`,
      label: collection.title,
      path: `collection_${collectionId}`,
      url: undefined,
      isRaster: true,
      isStac: true,
      isMosaicJSON: true,
      children: [],
    }
    if (fc.features.length === 0) {
      throw error(404, { message: `No data found in ${collectionId}: ${collection.title}` })
    }
    const item = fc.features[0]
    const itemProperties = item.properties
    Object.keys(item.assets).forEach((assetName) => {
      const asset = item.assets[assetName]
      if (asset.type !== 'image/tiff; application=geotiff; profile=cloud-optimized') return
      // generate URL for search API except bbox parameter
      // bbox needs to be specified from frontend based on the current viewing.
      // this search URL does not work, it needs to be converted to POST version from query params specified by frontend.
      let searchUrl = `${rootUrl}search?collections=${collectionId}&sortby=${'datetime'}&limit=${LIMIT}`
      if (itemProperties['eo:cloud_cover']) {
        searchUrl = `${searchUrl}&filter=${JSON.stringify({ op: '<=', args: [{ property: 'eo:cloud_cover' }, 5] })}`
      }
      let description = `
        ${collection.description}
        `
      if (collection.summaries && collection.summaries['eo:bands']) {
        const band = collection.summaries['eo:bands'].find((band) => band.name === assetName)
        if (band && band.description) {
          description = band.description
        }
      }

      catalog.children.push({
        id: `${catalog.id}_${collectionId}_${assetName}`,
        label: asset.title ? asset.title : asset.roles[0],
        description: description,
        path: `${assetName}`,
        url: searchUrl,
        isRaster: true,
        isStac: true,
        isMosaicJSON: true,
        // children: [],
      })
    })
    if (catalog.children.length === 0) {
      throw error(404, `No item found in ${collectionId}: ${collection.title}`)
    }
  } else {
    // others
    throw error(400, { message: 'Bad request' })
  }

  return new Response(
    JSON.stringify({
      tree: catalog,
    }),
  )
}

const getCollections = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const collection = await res.json()
  const collections: StacCollection[] = collection.collections
  return collections
}

const getCollection = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const collection: StacCollection = await res.json()
  return collection
}

const getItem = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText })
  }
  const fc: StacItemFeatureCollection = await res.json()
  return fc
}
