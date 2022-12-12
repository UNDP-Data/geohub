import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
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
      throw new Error(`id parameter is required.`)
    }
    const query = {
      text: `SELECT style FROM geohub.style WHERE id = $1`,
      values: [styleId],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      throw new Error(`${styleId} does not exist in the database`)
    }
    const style = res.rows[0].style
    return new Response(JSON.stringify(style))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    client.release()
    pool.end()
  }
}
