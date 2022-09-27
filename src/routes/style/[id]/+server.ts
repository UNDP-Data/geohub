import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import { pgClient } from '$lib/util'

/**
 * Delete style.json which is stored in PostgreSQL database
 * DELETE: ./style/{id}
 */
export const DELETE: RequestHandler = async ({ params }) => {
  const client = pgClient()
  await client.connect()
  try {
    const styleId = params.id
    if (!styleId) {
      throw new Error(`id parameter is required.`)
    }
    const query = {
      text: `DELETE FROM geohub.style WHERE id = $1`,
      values: [styleId],
    }

    const res = await client.query(query.text, query.values)
    if (res.rows.length === 0) {
      throw new Error(`${styleId} does not exist in the database`)
    }
    return new Response(undefined, {
      status: 204,
    })
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    await client.end()
  }
}
