import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Region API
 * return region data
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  const continent_code = url.searchParams.get('continent')
  try {
    let values = []
    if (continent_code) {
      values.push(continent_code)
    }

    const sql = {
      text: `
      SELECT region2_code as region_code, region2_name as region_name, region1_code as continent_code, region1_name as continent_name
      FROM geohub.country
      ${continent_code ? `WHERE region1_code = $1` : ''}
      GROUP BY region2_code, region2_name, region1_code, region1_name
      ORDER BY region2_name`,
      values: values,
    }
    // console.log(sql)
    const res = await client.query(sql)
    return new Response(JSON.stringify(res.rows))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
