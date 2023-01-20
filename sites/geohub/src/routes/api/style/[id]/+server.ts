import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
const connectionString = DATABASE_CONNECTION

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
      text: `SELECT id, name, style, layers, createdat, updatedat FROM geohub.style where id = $1`,
      values: [styleId],
    }

    const res = await client.query(query)

    if (res.rowCount === 0) {
      return new Response(undefined, {
        status: 404,
      })
    }

    return new Response(JSON.stringify(res.rows[0]))
  } finally {
    client.release()
    pool.end()
  }
}

/**
 * Delete style.json which is stored in PostgreSQL database
 * DELETE: ./api/style/{id}
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify({ message: 'Permission error' }), {
      status: 403,
    })
  }
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
      text: `DELETE FROM geohub.style WHERE id = $1`,
      values: [styleId],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      return new Response(JSON.stringify({ message: `${styleId} does not exist in the database` }), {
        status: 404,
      })
    }
    return new Response(undefined, {
      status: 204,
    })
  } finally {
    client.release()
    pool.end()
  }
}
