import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import fs from 'fs'
import type { StacCollection, StacItemFeatureCollection } from '$lib/StacType'
import type { TreeNode } from '$lib/types'

import path from 'path'
const __dirname = path.resolve()

export const GET: RequestHandler = async ({ url }) => {
  const catalogues = JSON.parse(fs.readFileSync(`${__dirname}/data/mosaic-stac.json`, 'utf8'))
  const catalogIds = url.searchParams.get('id')
  const containerPath = url.searchParams.get('path')

  const catalogId = catalogIds.split(',')[0]
  console.log(catalogId)
  console.log(containerPath)

  let catalog: TreeNode = catalogues.find((catalog) => catalog.id === catalogId)
  if (!catalog) {
    throw error(400, { message: `${catalogId} is invalid` })
  }

  const baseUrl = catalog.url

  if (catalog.path === containerPath) {
    // /api/stac/v1/collections
    const apiUrl = `${baseUrl}${catalog.path}`
    const collections = await getCollections(apiUrl)
    catalog.children = []
    collections.forEach((collection) => {
      catalog.children.push({
        id: `${catalog.id},${collection.id}`,
        label: collection.title,
        path: `${apiUrl}/${collection.id}/items?limit=1`,
        url: undefined,
        isRaster: true,
        isStac: true,
        isMosaicJSON: true,
        children: [],
      })
    })
  } else {
    // /api/stac/v1/collections/{collection_id}/items?limit=1
    const item = await getItem(containerPath)
    console.log(item)
    const collectionUrl = item.links.find((link) => link.rel === 'collection').href
    console.log(collectionUrl)
    const collection = await getCollection(collectionUrl)
    catalog = {
      id: `${catalog.id},${collection.id}`,
      label: collection.title,
      path: `${baseUrl}/${collection.id}/items?limit=1`,
      url: undefined,
      isRaster: true,
      isStac: true,
      isMosaicJSON: true,
      children: [],
    }
    Object.keys(item.assets).forEach((key) => {
      const asset = item.assets[key]
      if (asset.type !== 'image/tiff; application=geotiff; profile=cloud-optimized') return
      const searchUrl = `${baseUrl}/search?collections=${
        collection.id
      }&sortby=${'datetime'}&limit=${20}&filter=${encodeURIComponent(
        JSON.stringify({ op: '<=', args: [{ property: 'eo:cloud_cover' }, 10] }),
      )}`
      catalog.children.push({
        id: `${catalog.id},${collection.id},${key}`,
        label: asset.title,
        path: `${collection.id}-${key}`,
        url: searchUrl,
        isRaster: true,
        isStac: true,
        isMosaicJSON: true,
        children: [],
      })
    })
  }
  // console.log(catalog)

  return new Response(
    JSON.stringify({
      tree: catalog,
    }),
  )
}

const getCollections = async (url: string) => {
  const res = await fetch(url)
  const collection = await res.json()
  const collections: StacCollection[] = collection.collections
  return collections
}

const getCollection = async (url: string) => {
  const res = await fetch(url)
  const collection: StacCollection = await res.json()
  return collection
}

const getItem = async (url: string) => {
  const res = await fetch(url)
  const fc: StacItemFeatureCollection = await res.json()
  return fc.features[0]
}
