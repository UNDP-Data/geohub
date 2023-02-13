import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Country API
 * return country data
 */
export const GET: RequestHandler = async ({ url }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  const continent_code = url.searchParams.get('continent')
  const region_code = url.searchParams.get('region')
  try {
    let values = []
    let wheres: string[] = []
    if (continent_code) {
      values.push(continent_code)
      wheres.push(` region1_code=$${values.length} `)
    }
    if (region_code) {
      values.push(region_code)
      wheres.push(` region2_code=$${values.length} `)
    }

    const sql = {
      text: `
      SELECT 
        iso_3, 
        iso_code, 
        iso_2, 
        name as country_name,
        region2_code as region_code, 
        region2_name as region_name, 
        region1_code as continent_code, 
        region1_name as continent_name
      FROM geohub.country
      ${continent_code || region_code ? `WHERE ${wheres.join(' AND ')}` : ''}
      GROUP BY 
        iso_3, 
        iso_code, 
        iso_2, 
        name,
        region2_code, 
        region2_name, 
        region1_code, 
        region1_name
      ORDER BY name`,
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
