import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { env } from '$env/dynamic/private'
const connectionString = env.DATABASE_CONNECTION

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const GET: RequestHandler = async () => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style`,
      values: [],
    }

    const res = await client.query(query)

    return new Response(JSON.stringify({ count: Number(res.rows[0].count) }))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
