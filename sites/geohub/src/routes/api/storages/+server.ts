import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Storage search API
 * Example
 * http://localhost:5173/api/storages?query=microsoft&type=stac
 * http://localhost:5173/api/storages?sdg=1&keyword=poverty
 * Query Params
 * - query = free text to search in `label` and `description`.
 *     AND search is `aaa and bbb`
 *     OR search is `aaa or bbb`
 *     If queried text contains space like 'water quality', query='water quality' should be used with single quatation.
 * - {key}={value} e.g., type=stac to filter where tag key is 'type' and value is 'stac'. If multiple key/value are set, it will filter by OR operator.
 *   if you want to filter by SDG1 and 2, you can query like '&sdg=1&sdg=2'. 'keyword', 'type' and 'sdg' are available for key value.
 * @returns JSON object's array
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = url.searchParams.get('query')

    const filters: { key: string; value: string }[] = []
    url.searchParams.forEach((key, value) => {
      if (['query'].includes(value)) return
      filters.push({
        key: value,
        value: key.toLowerCase(),
      })
    })

    const values: string[] = []

    const conditions: string[] = []
    const queryFilter = getQueryFilter(query, values)
    if (queryFilter) conditions.push(queryFilter)
    const tagFilter = getTagFilter(filters, values)
    if (tagFilter) conditions.push(tagFilter)

    const sql = {
      text: `
      SELECT
        x.id, 
        x.name, 
        x.url, 
        x.label, 
        x.description, 
        x.icon, 
        dt_tags.tags
      FROM geohub.storage x
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
        FROM geohub.storage x
        LEFT JOIN geohub.storage_tag y
        ON x.id = y.storage_id
        INNER JOIN geohub.tag z
        ON y.tag_id = z.id
        GROUP BY
        x.id
      ) as dt_tags
      ON x.id = dt_tags.id
      ${
        conditions.length === 0
          ? ''
          : `
      WHERE ${conditions.join(' AND ')}
      `
      }
      ORDER BY
          ${
            !query
              ? ''
              : `
          ts_rank_cd(to_tsvector(x.label),to_tsquery($1)) desc,
          ts_rank_cd(to_tsvector(x.description),to_tsquery($1)) desc,`
          }
        x.label
      `,
      values: values,
    }
    // console.log(sql)
    const res = await client.query(sql)

    return new Response(JSON.stringify(res.rows))
  } finally {
    client.release()
    pool.end()
  }
}

const getQueryFilter = (query: string, values: string[]) => {
  if (!query) return
  // normalise query text for to_tsquery function
  query = query
    .toLowerCase()
    .replace(/\r?and/g, '&') // convert 'and' to '&'
    .replace(/\r?or/g, '|') // convert 'or' to '|'
  values.push(query)
  return `(
    to_tsvector(x.label) @@ to_tsquery($${values.length})
  OR to_tsvector(x.description) @@ to_tsquery($${values.length})
  )`
}

const getTagFilter = (filters: { key: string; value: string }[], values: string[]) => {
  if (filters.length === 0) return
  return `
  EXISTS(
    SELECT a.id 
    FROM geohub.tag as a 
    INNER JOIN geohub.storage_tag as b
    ON a.id = b.tag_id
    WHERE b.storage_id = x.id AND (
    ${filters
      .map((filter) => {
        values.push(filter.key)
        const keyLength = values.length
        values.push(filter.value)
        const valueLength = values.length
        return `
    (a.key = $${keyLength} and to_tsvector(a.value) @@ to_tsquery($${valueLength}))
    `
      })
      .join('OR')}
    ))`
}
