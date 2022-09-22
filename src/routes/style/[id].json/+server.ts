import pkg from 'pg'
const { Pool } = pkg
import { error } from '@sveltejs/kit'

const connectionString = import.meta.env.VITE_DATABASE_CONNECTION

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./style/{id}.json
 */
export async function GET({ params }) {
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
    throw error(400, {
      message: err.message,
    })
  } finally {
    client.release()
    pool.end()
  }
}
