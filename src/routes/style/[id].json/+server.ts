import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import { pgClient } from '$lib/util'

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./style/{id}.json
 */
export const GET: RequestHandler = async ({ params }) => {
  const client = pgClient()
  await client.connect()
  try {
    const styleId = params.id
    if (!styleId) {
      throw new Error(`id parameter is required.`)
    }
    const query = {
      text: `SELECT style FROM geohub.style WHERE id = $1`,
      values: [styleId],
    }

    const res = await client.query(query.text, query.values)
    if (res.rows.length === 0) {
      throw new Error(`${styleId} does not exist in the database`)
    }

    let style
    for await (const row of res) {
      style = row.get('style')
    }
    return new Response(JSON.stringify(style))
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    await client.end()
  }
}
