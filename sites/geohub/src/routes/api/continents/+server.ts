import type { RequestHandler } from './$types'
import DatabaseManager from '$lib/server/DatabaseManager'

/**
 * Continent API
 * return continent data
 */
export const GET: RequestHandler = async () => {
  const dbm = new DatabaseManager()
  const client = await dbm.start()
  try {
    const sql = {
      text: `
      SELECT region1_code as continent_code, region1_name as continent_name
      FROM geohub.country
      GROUP BY region1_code, region1_name
      ORDER BY region1_name`,
    }
    // console.log(sql)
    const res = await client.query(sql)
    return new Response(JSON.stringify(res.rows))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    dbm.end()
  }
}
