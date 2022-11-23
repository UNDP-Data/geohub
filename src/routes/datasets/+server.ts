import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/variables/private'
import type { StacLink } from '$lib/types'
const connectionString = DATABASE_CONNECTION

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
 * - limit = default is 10
 * - offset = default is 0
 * - {key}={value} e.g., sdg_goal=1 to filter where tag key is `sdg_goal` and value is 1. If multiple key/value are set, it will filter by OR operator.
 *   if you want to filter by SDG1 and 2, you can query like '&sdg_goal=1&sdg_goal=2'
 * @returns GeojSON FeatureCollection
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    let query = url.searchParams.get('query')
    const _limit = url.searchParams.get('limit') || 10
    const limit = Number(_limit)
    const _offset = url.searchParams.get('offset') || 0
    const offset = Number(_offset)
    const storage_id = url.searchParams.get('storage_id')
    const bbox = url.searchParams.get('bbox')
    let bboxCoordinates: number[]
    if (bbox) {
      bboxCoordinates = bbox.split(',').map((val) => Number(val))
      if (bboxCoordinates.length !== 4) {
        throw error(400, 'Invalid bbox')
      }
    }

    const filters: { key: string; value: string }[] = []
    url.searchParams.forEach((key, value) => {
      if (['query', 'offset', 'limit', 'storage_id', 'bbox'].includes(value)) return
      filters.push({
        key: value,
        value: key.toLowerCase(),
      })
    })

    const values = []
    if (query) {
      // normalise query text for to_tsquery function
      query = query
        .toLowerCase()
        .replace(/\r?and/g, '&') // convert 'and' to '&'
        .replace(/\r?or/g, '|') // convert 'or' to '|'
      values.push(query)
    }

    const sql = {
      text: `
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
            dt_tags.tags
          ) AS p
          )) AS properties
          FROM geohub.dataset x
          LEFT JOIN geohub.dataset_tag y
          ON x.id = y.dataset_id
          LEFT JOIN geohub.tag z
          ON y.tag_id = z.id
          LEFT JOIN (
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
          ) as dt_tags
          ON x.id = dt_tags.id
        WHERE 
          NOT ST_IsEmpty(x.bounds)
          ${
            !query
              ? ''
              : `
          AND (
            to_tsvector(x.name) @@ to_tsquery($1)
           OR to_tsvector(x.description) @@ to_tsquery($1)
           OR to_tsvector(z.value) @@ to_tsquery($1)
           )`
          }
          ${getStorageIdFilter(storage_id, values)}
          ${getTagFilter(filters, values)}
          ${getBBoxFilter(bboxCoordinates, values)}
        ORDER BY
          ${
            !query
              ? ''
              : `
          ts_rank_cd(to_tsvector(x.name),to_tsquery($1)) desc,
          ts_rank_cd(to_tsvector(z.value),to_tsquery($1)) desc,`
          }
          x.updatedat desc
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
      {
        rel: 'next',
        type: 'application/json',
        href: nextUrl.toString(),
      },
    ]
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

    return new Response(JSON.stringify(geojson))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    client.release()
    pool.end()
  }
}

const getStorageIdFilter = (storage_id: string, values: string[]) => {
  if (storage_id) {
    values.push(storage_id)
  } else {
    return ''
  }
  return `AND x.storage_id=$${values.length} `
}

const getTagFilter = (filters: { key: string; value: string }[], values: string[]) => {
  if (filters.length === 0) return ''
  return `
    AND EXISTS(
    SELECT a.id FROM geohub.tag as a WHERE a.id = y.tag_id AND (
    ${filters
      .map((filter) => {
        values.push(filter.key)
        const keyLength = values.length
        values.push(filter.value)
        const valueLength = values.length
        return `
    (a.key = $${keyLength} and lower(a.value) = $${valueLength})
    `
      })
      .join('OR')}
    ))`
}

const getBBoxFilter = (bbox: number[], values: string[]) => {
  if (!(bbox && bbox.length === 4)) return ''
  bbox.forEach((val) => {
    values.push(val.toString())
  })
  return `
  AND ST_INTERSECTS(
    x.bounds, 
    ST_MakeEnvelope(
      $${values.length - 3}::double precision,
      $${values.length - 2}::double precision,
      $${values.length - 1}::double precision,
      $${values.length}::double precision
      , 4326
    )
  )
  `
}
