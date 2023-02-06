import type { RequestHandler } from './$types'
import pkg from 'pg'
const { Pool } = pkg

import { DATABASE_CONNECTION } from '$lib/server/variables/private'
import { getStarCount } from '$lib/server/helpers'
const connectionString = DATABASE_CONNECTION

export const GET: RequestHandler = async ({ params }) => {
  const dataset_id = params.id

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const stars = await getStarCount(client, dataset_id)

    const res = {
      dataset_id,
      no_stars: stars,
    }

    return new Response(JSON.stringify(res))
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    client.release()
    pool.end()
  }
}
