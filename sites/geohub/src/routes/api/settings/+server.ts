import type { RequestHandler } from '@sveltejs/kit'
import DatabaseManager from '$lib/server/DatabaseManager'
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig'

export const POST: RequestHandler = async ({ request, url, locals }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify({ message: 'Permission error' }), {
      status: 403,
    })
  }
  // Create a new DatabaseManager instance and create a new client
  const dbm = new DatabaseManager()
  const client = await dbm.start()

  try {
    const body = await request.json()
    const query = {
      text: `INSERT INTO geohub.user_settings (user_email, settings) VALUES ($1, $2) ON CONFLICT (user_email) DO UPDATE SET settings = $2`,
      values: [session.user.email, body],
    }
    await client.query(query)
    return new Response(JSON.stringify({ message: 'Settings saved' }), {})
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    await dbm.end()
  }
}

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify(DefaultUserConfig), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  const user_email = session.user.email
  const dbm = new DatabaseManager()
  const client = await dbm.start()
  try {
    const query = {
      text: `SELECT settings FROM geohub.user_settings WHERE user_email = '${user_email}'`,
    }
    const res = await client.query(query)
    if (res.rowCount === 0) {
      // no settings found for this user in the database
      return new Response(JSON.stringify(DefaultUserConfig), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const data: UserConfig = Object.assign(DefaultUserConfig, res.rows[0].settings as UserConfig)
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  } finally {
    await dbm.end()
  }
}
