import type { PageServerLoad } from './$types'
import pkg from 'pg'
const { Pool } = pkg
const connectionString = import.meta.env.VITE_DATABASE_CONNECTION

export const load: PageServerLoad = async () => {
  const defaultPage = 1
  const defaultPageSize = 8
  const totalItemsCount = await getStyleCount()
  const totalPagesCount = Math.ceil(totalItemsCount / defaultPageSize)

  return {
    defaultPage,
    defaultPageSize,
    totalItemsCount,
    totalPagesCount,
  }
}

const getStyleCount = async () => {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style`,
      values: [],
    }

    const res = await client.query(query)

    return res.rows[0].count
  } finally {
    client.release()
    pool.end()
  }
}
