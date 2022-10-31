import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import { ErrorMessages } from '$lib/constants'

import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/variables/private'
const connectionString = DATABASE_CONNECTION

export const GET: RequestHandler = async ({ url }) => {
  if (url === undefined || url.searchParams === undefined || !url.searchParams.has('layer_name')) {
    throw error(400, JSON.stringify({ message: 'missing layer_name parameter' }))
  }

  const layer_name = url.searchParams.get('layer_name')
  const names = layer_name.split('.')
  if (names.length !== 2) {
    throw error(400, JSON.stringify({ message: `format of layer_name paramer is incorrect.` }))
  }

  const schemaName = names[0]
  const tableName = names[1]

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `select vectorinfo from geohub.get_vectorinfo($1, $2)`,
      values: [schemaName, tableName],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      throw error(404)
    }
    const vectorInfo = res.rows[0].vectorinfo
    return new Response(JSON.stringify(vectorInfo))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    client.release()
    pool.end()
  }
}
