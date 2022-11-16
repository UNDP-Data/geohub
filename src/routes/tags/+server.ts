import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Tags API - return available keys and values in tag table
 * Example
 * http://localhost:5173/tags?key=sdg_goal
 * Query Params
 * - key = only filter by key name. if it is not specified, all values will be returned
 * @returns the list of key and value in tag table
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const key = url.searchParams.get('key')

    const values = []
    if (key) {
      values.push(key)
    }

    const sql = {
      text: `
      SELECT distinct key, value FROM geohub.tag
      WHERE EXISTS (SELECT * FROM geohub.dataset_tag WHERE tag_id = id)
      ${
        !key
          ? ''
          : `
      AND key = $1
      `
      }
      ORDER BY key, value
      `,
      values: values,
    }

    const res = await client.query(sql)
    if (res.rowCount === 0) {
      return error(404, `no tag found`)
    }

    const result: { [key: string]: string[] } = {}
    res.rows.forEach((row) => {
      if (!row.key) {
        return
      }
      if (!result[row.key]) {
        result[row.key] = []
      }
      result[row.key] = [...result[row.key], row.value]
    })

    return new Response(JSON.stringify(result))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    client.release()
    pool.end()
  }
}
