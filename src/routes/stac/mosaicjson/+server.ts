import type { StacItemFeatureCollection } from '$lib/types'
import type { RequestHandler } from './$types'
import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

const TITILER_MOSAIC_ENDPOINT = PUBLIC_TITILER_ENDPOINT.replace('cog', 'mosaicjson')

import { v4 as uuidv4 } from 'uuid'
import { AccountSASPermissions, BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)

import fs from 'fs'
import path from 'path'
import { error } from '@sveltejs/kit'
const __dirname = path.resolve()

export const GET: RequestHandler = async ({ url }) => {
  const searchUrl = url.searchParams.get('url')
  const bbox: number[] = JSON.parse(url.searchParams.get('bbox'))
  const asset = url.searchParams.get('asset')

  const searchResult = await searchStacItemUrls(searchUrl, bbox, asset)
  const mosaicJsonUrl = await createTitilerMosaicJsonEndpoint(searchResult.urls, searchResult.filter)
  const tileJsonUrl = createMosaicTileJson(mosaicJsonUrl)
  return new Response(
    JSON.stringify({
      tilejson: tileJsonUrl,
      mosaicjson: mosaicJsonUrl,
    }),
  )
}

const searchStacItemUrls = async (url: string, bbox: number[], targetAsset: string) => {
  // convert GET url to Post url for /search api
  const _url = new URL(url)
  const collections = _url.searchParams.get('collections')
  const sortby = _url.searchParams.get('sortby')
  const limit = _url.searchParams.get('limit')
  const filter = _url.searchParams.get('filter')
  const baseUrl = `${_url.origin}${_url.pathname}`
  const payload = {
    'filter-lang': 'cql2-json',
    filter: {
      op: 'and',
      args: [
        {
          op: '=',
          args: [
            {
              property: 'collection',
            },
            collections,
          ],
        },
        {
          op: 's_intersects',
          args: [
            {
              property: 'geometry',
            },
            {
              type: 'Polygon',
              coordinates: [
                [
                  [bbox[0], bbox[1]],
                  [bbox[2], bbox[1]],
                  [bbox[2], bbox[3]],
                  [bbox[0], bbox[3]],
                  [bbox[0], bbox[1]],
                ],
              ],
            },
          ],
        },
      ],
    },
    limit: limit,
    sortby: [
      {
        field: sortby,
        direction: 'asc',
      },
    ],
  }
  if (filter) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    payload.filter.args.push(JSON.parse(filter))
  }

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(JSON.parse(JSON.stringify(payload))),
  })
  if (!res.ok) {
    throw error(res.status, { message: res.statusText})
  }

  const fc: StacItemFeatureCollection = await res.json()
  const itemUrls: string[] = []

  const sasToken = await getMsStacToken(url)

  fc.features.forEach((f) => {
    itemUrls.push(`${f.assets[targetAsset].href}?${sasToken}`)
  })
  return {
    urls: itemUrls,
    filter: JSON.stringify(payload),
  }
}

const createTitilerMosaicJsonEndpoint = async (urls: string[], filter: string) => {
  const payload = {
    url: urls,
    minzoom: 0,
    maxzoom: 22,
    attribution: `<a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme</a>`,
  }
  const res = await fetch(`${TITILER_MOSAIC_ENDPOINT}/create`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(JSON.parse(JSON.stringify(payload))),
  })
  if (!res.ok) {
    throw error(res.status, { message: res.statusText})
  }
  const json = await res.json()

  const blobUrl = await storeMosaicJson2Blob(json, filter)
  console.log(`mosaicjson was generated at: ${blobUrl}`)
  return blobUrl
}

const createMosaicTileJson = (mosaicJsonurl: string) => {
  // const rio_formula = 'gamma G 1.85 gamma B 1.95 sigmoidal RGB 35 0.13 saturation 1.15'
  const url = `${TITILER_MOSAIC_ENDPOINT}/tilejson.json?url=${encodeURIComponent(mosaicJsonurl)}`
  return url
}

const getMsStacToken = async (originUrl: string) => {
  const _url = new URL(originUrl)
  const collectionId = _url.searchParams.get('collections')
  const url = `${_url.origin}/api/sas/v1/token/${collectionId}`
  const res = await fetch(url)
  if (!res.ok) {
    throw error(res.status, { message: res.statusText})
  }
  const json = await res.json()
  const token = json.token
  return token
}

const storeMosaicJson2Blob = async (mosaicjson: JSON, filter: string) => {
  // create storage container
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    sharedKeyCredential,
  )

  const containerName = 'mosaicjson'

  const containerClient = blobServiceClient.getContainerClient(containerName)

  const blobName = `${uuidv4()}.json`
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName)

  const tmpDir = path.resolve(`${__dirname}/tmp/`)
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
  }

  const localFileWithPath = path.resolve(tmpDir, blobName)
  fs.writeFileSync(localFileWithPath, JSON.stringify(mosaicjson))

  // upload options
  const uploadOptions = {
    tags: {
      filter: JSON.parse(filter).filter.args[0].args[1],
      createdBy: 'GeoHub API',
      createdOn: new Date().toDateString(),
    },
  }

  // upload file to blob storage
  await blockBlobClient.uploadFile(localFileWithPath, uploadOptions)
  // console.log(`${blobName} succeeded`);

  fs.unlinkSync(localFileWithPath)

  const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + 86400000),
    AccountSASPermissions.parse('r'),
    'o',
  )
  const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI)

  return `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}${ACCOUNT_SAS_TOKEN_URL.search}`
}
