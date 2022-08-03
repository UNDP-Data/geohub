import pkg from 'pg'
const { Pool } = pkg

const connectionString = import.meta.env.VITE_DATABASE_CONNECTION

/**
 * Get the list of saved style from PostGIS database
 * GET: ./style
 * [
 *   {
 *     "id": 1,
 *     "name": "UNDP GeoHub style",
 *     "createdat": "2022-07-29T15:59:23.781Z",
 *     "style": "http://localhost:3000/style/1.json",
 *     "viewer": "http://localhost:3000/viewer?style=http://localhost:3000/style/1.json"
 *   }
 * ]
 */
export async function GET({ url }) {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const query = {
      text: `SELECT id, name, createdat FROM geohub.style`,
      values: [],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      return {
        status: 404,
        headers: {
          'access-control-allow-origin': '*',
        },
      }
    }

    res.rows.forEach((row) => {
      const id = row.id
      row.style = `${url.origin}/style/${id}.json`
      row.viewer = `${url.origin}/viewer?style=${row.style}`
    })

    return {
      status: 200,
      headers: {
        'access-control-allow-origin': '*',
      },
      body: res.rows,
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

/**
 * Save style.json to PostgreSQL database
 * POST: ./style
 * body = {
 *   name: [style name]
 *   style: [style.json]
 * }
 */
export async function POST({ request, url }) {
  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    const body = await request.json()
    if (!body.name) {
      throw new Error('name property is required')
    }
    if (!body.style) {
      throw new Error('style property is required')
    }

    const query = {
      text: `INSERT INTO geohub.style (name, style) VALUES ($1, $2) returning id`,
      values: [body.name, JSON.stringify(body.style)],
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
      throw new Error('failed to insert to the database.')
    }
    const id = res.rows[0].id
    return {
      status: 200,
      headers: {
        'access-control-allow-origin': '*',
      },
      body: {
        url: `${url.origin}/viewer?style=${url.origin}/style/${id}.json`,
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
