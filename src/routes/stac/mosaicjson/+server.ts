import type { StacItemFeatureCollection } from '$lib/types'
import type { RequestHandler } from './$types'
import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
import { getBase64EncodedUrl } from '$lib/helper'

const TITILER_MOSAIC_ENDPOINT = PUBLIC_TITILER_ENDPOINT.replace('cog', 'mosaicjson')

export const GET: RequestHandler = async ({ url }) => {
  const searchUrl = url.searchParams.get('url')
  const bbox: number[] = JSON.parse(url.searchParams.get('bbox'))
  const asset = url.searchParams.get('asset')

  const itemUrls = await searchStacItemUrls(searchUrl, bbox, asset)
  const mosaicJsonUrl = createTitilerMosaicJsonEndpoint(itemUrls)
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

  const fc: StacItemFeatureCollection = await res.json()
  const itemUrls: string[] = []

  const sasToken = await getMsStacToken(url)

  fc.features.forEach((f) => {
    itemUrls.push(`${f.assets[targetAsset].href}?${sasToken}`)
  })
  return itemUrls
}

const createTitilerMosaicJsonEndpoint = (urls: string[]) => {
  const url = `${TITILER_MOSAIC_ENDPOINT}/create?${urls
    .map((url, index) => `${index > 0 ? '&' : ''}url=${getBase64EncodedUrl(url)}`)
    .join('')}`
  return url
}

const createMosaicTileJson = (mosaicJsonurl: string) => {
  // const rio_formula = 'gamma G 1.85 gamma B 1.95 sigmoidal RGB 35 0.13 saturation 1.15'
  const url = `${TITILER_MOSAIC_ENDPOINT}/tilejson.json?url=${encodeURIComponent(mosaicJsonurl)}&resampling=nearest`
  return url
}

const getMsStacToken = async (originUrl: string) => {
  const _url = new URL(originUrl)
  const collectionId = _url.searchParams.get('collections')
  const url = `${_url.origin}/api/sas/v1/token/${collectionId}`
  const res = await fetch(url)
  const json = await res.json()
  const token = json.token
  return token
}
