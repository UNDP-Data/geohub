import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./api/style/{id}.json
 */
export const GET: RequestHandler = async ({ params }) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const styleId = params.id
    if (!styleId) {
      return new Response(JSON.stringify({ message: `id parameter is required.` }), {
        status: 400,
      })
    }
    const query = {
      text: `SELECT style FROM geohub.style WHERE id = $1`,
      values: [styleId],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      return new Response(JSON.stringify({ message: `${styleId} does not exist in the database` }), {
        status: 404,
      })
    }
    const style = res.rows[0].style
    return new Response(JSON.stringify(style))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
