import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/variables/private'
import type { StacLink } from '$lib/types'
const connectionString = DATABASE_CONNECTION

import { AccountSASPermissions, BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY } from '$lib/variables/private'
import { TOKEN_EXPIRY_PERIOD_MSEC } from '$lib/constants'
import { createDatasetSearchWhereExpression } from '$lib/helper'

/**
 * Datasets search API
 * Example
 * http://localhost:5173/datasets?limit=10&offset=0&sdg_goal=1&query=kenya&bbox=35.26,-1.058,40.473,1.968&storage_id=4019fd03c7cc612686a6db0fde231206
 * Query Params
 * - query = free text to search in `name`, `description` and `tag value`.
 *     AND search is `aaa and bbb`
 *     OR search is `aaa or bbb`
 *     If queried text contains space like 'water quality', query='water quality' should be used with single quatation.
 * - storage_id = you can also filter by directly storage_id
 * - bbox = you can filter the data by bounding box (minx, miny, maxx, maxy)
 * - sortby = set parameter like "sortby=name, desc". support sorting by 'name', 'source', 'license', 'createdat', 'updatedat'. Default order is ASC.
 * - limit = default is 10
 * - offset = default is 0
 * - {key}={value} e.g., sdg_goal=1 to filter where tag key is `sdg_goal` and value is 1. If multiple key/value are set, it will filter by OR operator.
 *   if you want to filter by SDG1 and 2, you can query like '&sdg_goal=1&sdg_goal=2'
 * - operator = 'and' or 'or'. This operator can be applied for tag search of {key}={value}
 * @returns GeojSON FeatureCollection
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const _limit = url.searchParams.get('limit') || 10
    const limit = Number(_limit)
    const _offset = url.searchParams.get('offset') || 0
    const offset = Number(_offset)

    const sortby = url.searchParams.get('sortby')
    let sortByColumn = 'name'
    let SortOrder: 'asc' | 'desc' = 'asc'
    if (sortby) {
      const values = sortby.split(',')
      const column: string = values[0].trim().toLowerCase()
      const targetSortingColumns = ['name', 'source', 'license', 'createdat', 'updatedat']
      const targetSortingOrder = ['asc', 'desc']
      if (!targetSortingColumns.includes(column)) {
        console.log(targetSortingColumns, column)
        throw error(400, `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(', ')}'`)
      }
      sortByColumn = column

      if (values.length > 1) {
        const order: string = values[1].trim().toLowerCase()
        if (!targetSortingOrder.includes(order)) {
          throw error(
            400,
            `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(', ')}'`,
          )
        }
        SortOrder = order as 'asc' | 'desc'
      }
    }

    const whereExpressesion = await createDatasetSearchWhereExpression(url, 'x')
    const values = whereExpressesion.values

    const sql = {
      text: `
      WITH datasetTags as (
        SELECT
        x.id,
        array_to_json(array_agg(row_to_json((
          SELECT p FROM (
          SELECT
            z.key,
            z.value
          ) AS p
          )))) AS tags
        FROM geohub.dataset x
        LEFT JOIN geohub.dataset_tag y
        ON x.id = y.dataset_id
        INNER JOIN geohub.tag z
        ON y.tag_id = z.id
        GROUP BY
          x.id
      )
      SELECT row_to_json(featurecollection) AS geojson 
      FROM (
        SELECT
          'FeatureCollection' AS type,
          array_to_json(array_agg(feature)) AS features
        FROM (
          SELECT
          'Feature' AS type,
          ST_AsGeoJSON(ST_TRANSFORM(x.bounds,4326))::json AS geometry,
          row_to_json((
          SELECT p FROM (
          SELECT
            x.id, 
            x.storage_id, 
            x.url, 
            x.name,
            x.description,
            x.is_raster, 
            x.source, 
            x.license, 
            x.createdat, 
            x.updatedat,
            y.tags
          ) AS p
          )) AS properties
          FROM geohub.dataset x
          LEFT JOIN datasetTags y
          ON x.id = y.id
        ${whereExpressesion.sql}
        ORDER BY
          x.${sortByColumn} ${SortOrder}
        LIMIT ${limit}
        OFFSET ${offset}
        ) AS feature
      ) AS featurecollection
      `,
      values: values,
    }
    // console.log(sql)
    const res = await client.query(sql)
    const geojson = res.rows[0].geojson
    if (!geojson.features) {
      geojson.features = []
    }

    const nextUrl = new URL(url.toString())
    nextUrl.searchParams.set('limit', limit.toString())
    nextUrl.searchParams.set('offset', (offset + limit).toString())
    const links: StacLink[] = [
      {
        rel: 'root',
        type: 'application/json',
        href: `${url.origin}${url.pathname}`,
      },
      {
        rel: 'self',
        type: 'application/json',
        href: url.toString(),
      },
    ]

    if (geojson.features.length === limit) {
      links.push({
        rel: 'next',
        type: 'application/json',
        href: nextUrl.toString(),
      })
    }

    if (offset > 0) {
      const previoustUrl = new URL(url.toString())
      previoustUrl.searchParams.set('limit', limit.toString())
      previoustUrl.searchParams.set('offset', (offset - limit).toString())

      links.push({
        rel: 'previous',
        type: 'application/json',
        href: previoustUrl.toString(),
      })
    }

    geojson.links = links

    // add SAS token if it is Azure Blob source
    const sasToken = generateAzureBlobSasToken()
    geojson.features.forEach((feature) => {
      const tags: [{ key: string; value: string }] = feature.properties.tags
      const type = tags?.find((tag) => tag.key === 'type')
      if (type && ['martin', 'pgtileserv', 'stac'].includes(type.value)) return
      feature.properties.url = `${feature.properties.url}${sasToken}`
    })

    return new Response(JSON.stringify(geojson))
  } finally {
    client.release()
    pool.end()
  }
}

const generateAzureBlobSasToken = () => {
  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY)
  // create storage container
  const blobServiceClient = new BlobServiceClient(
    `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
    sharedKeyCredential,
  )

  // generate account SAS token for vector tiles. This is needed because the
  // blob level SAS tokens have the blob name encoded inside the SAS token and the
  // adding a vector tile to mapbox requires adding a template/pattern not one file and reading many more files as well.

  const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
    new Date(new Date().valueOf() + TOKEN_EXPIRY_PERIOD_MSEC),
    AccountSASPermissions.parse('r'),
    'o',
  )
  const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI)
  return ACCOUNT_SAS_TOKEN_URL.search
}
