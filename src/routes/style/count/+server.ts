import type { RequestHandler } from './$types'
import { error } from '@sveltejs/kit'
import { pgClient } from '$lib/util'

/**
 * Get the total number of records of style table
 * GET: ./style/count
 */
export const GET: RequestHandler = async () => {
  const client = pgClient()
  await client.connect()
  try {
    const query = {
      text: `SELECT count(*) as count FROM geohub.style`,
      values: [],
    }
    const res = await client.query(query.text, query.values)
    let count: number
    for await (const row of res) {
      count = Number(row.get('count'))
    }
    return new Response(
      JSON.stringify({
        count,
      }),
    )
  } catch (err) {
    throw error(400, JSON.stringify({ message: err.message }))
  } finally {
    await client.end()
  }
}
