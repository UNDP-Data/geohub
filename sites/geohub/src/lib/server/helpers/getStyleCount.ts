import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const getStyleCount = async (where: string, values: string[]) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style x ${where}`,
      values: values,
    }

    const res = await client.query(query)

    return Number(res.rows[0].count)
  } finally {
    client.release()
    pool.end()
  }
}
