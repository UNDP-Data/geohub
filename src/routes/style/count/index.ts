import pkg from 'pg'
const { Pool } = pkg

const connectionString = import.meta.env.VITE_DATABASE_CONNECTION

/**
 * Get the total number of records of style table
 * GET: ./style/count
 */
export async function get() {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style`,
      values: [],
    }

    const res = await client.query(query)

    return {
      status: 200,
      headers: {
        'access-control-allow-origin': '*',
      },
      body: {
        count: res.rows[0].count,
      },
    }
  } catch (err) {
    return {
      status: 400,
      headers: {
        'access-control-allow-origin': '*',
      },
      body: {
        message: err.message,
      },
    }
  } finally {
    client.release()
    pool.end()
  }
}
