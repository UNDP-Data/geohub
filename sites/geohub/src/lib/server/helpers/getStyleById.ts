import pkg from 'pg'
const { Pool } = pkg

import { env } from '$env/dynamic/private'
const connectionString = env.DATABASE_CONNECTION

export const getStyleById = async (id: number) => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT id, name, style, layers, access_level, createdat, created_user, updatedat, updated_user FROM geohub.style where id = $1`,
      values: [id],
    }

    const res = await client.query(query)

    if (res.rowCount === 0) {
      return undefined
    }

    return res.rows[0]
  } finally {
    client.release()
    pool.end()
  }
}
