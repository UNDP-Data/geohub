import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/variables/private'
import type { Tag } from '$lib/types/Tag'
import { createDatasetSearchWhereExpression } from '$lib/helper'
const connectionString = DATABASE_CONNECTION

/**
 * Tags API - return available keys and values in tag table
 * Example
 * http://localhost:5173/api/tags?url=http://localhost:5173/api/datasets?stac=microsoft-pc&sortby=name%2Casc&limit=25
 * Query Params
 * - key = only filter by key name. if it is not specified, all values will be returned
 * - url = URL used for dataset search to filter available tags
 * @returns the list of key and value in tag table
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const key = url.searchParams.get('key')
    const currentQueryUrl = url.searchParams.get('url')

    let values = []
    if (key) {
      values.push(key)
    }

    let whereSql = ''
    if (currentQueryUrl) {
      const whereExpressesion = await createDatasetSearchWhereExpression(new URL(currentQueryUrl), 'a')
      whereSql = whereExpressesion.sql
      values = [...values, ...whereExpressesion.values]
    }

    const sql = {
      text: `
      WITH tag_count AS (
      SELECT c.key, c.value,  COUNT(a.id) as count
      FROM geohub.dataset a
      INNER JOIN geohub.dataset_tag b
      ON a.id = b.dataset_id
      INNER JOIN geohub.tag c
      ON b.tag_id = c.id
      ${whereSql}
      GROUP BY
      c.key, c.value
      )
      SELECT distinct x.key, x.value, y.count
      FROM geohub.tag x
      INNER JOIN tag_count y
      ON x.key = y.key
      AND x.value = y.value
      WHERE EXISTS (SELECT id FROM geohub.dataset_tag WHERE tag_id = x.id)
      ${
        !key
          ? ''
          : `
      AND x.key = $1
      `
      }
      ORDER BY x.key, x.value
      `,
      values: values,
    }

    const res = await client.query(sql)
    if (res.rowCount === 0) {
      throw error(404, `no tag found`)
    }

    const result: { [key: string]: Tag[] } = {}
    res.rows.forEach((row) => {
      if (!row.key) {
        return
      }
      if (!result[row.key]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result[row.key] = []
      }
      result[row.key].push({
        key: row.key,
        value: row.value,
        count: Number(row.count),
      })
    })

    return new Response(JSON.stringify(result))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    client.release()
    pool.end()
  }
}
