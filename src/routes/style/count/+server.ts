import pkg from 'pg'
const { Pool } = pkg
import { error } from '@sveltejs/kit'

const connectionString = import.meta.env.VITE_DATABASE_CONNECTION

/**
 * Get the total number of records of style table
 * GET: ./style/count
 */
export async function GET() {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style`,
      values: [],
    }

    const res = await client.query(query)

    return new Response(
      JSON.stringify({
        count: res.rows[0].count,
      }),
    )
  } catch (err) {
    throw error(400, {
      message: err.message,
    })
  } finally {
    client.release()
    pool.end()
  }
}
