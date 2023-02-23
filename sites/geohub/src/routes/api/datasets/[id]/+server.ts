import type { RequestHandler } from './$types'
import { getDatasetById } from '$lib/server/helpers'
import DatabaseManager from '$lib/server/DatabaseManager'
import DatasetManager from '$lib/server/DatasetManager'
import { Permission } from '$lib/constants'

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession()
  const user_email = session?.user.email
  const id = params.id

  const dbm = new DatabaseManager()
  const client = await dbm.start()
  try {
    const dataset = await getDatasetById(client, id, user_email)
    if (!dataset) {
      return new Response(JSON.stringify({ message: `No dataset found.` }), {
        status: 404,
      })
    }
    return new Response(JSON.stringify(dataset))
  } finally {
    dbm.end()
  }
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession()
  if (!session) {
    return new Response(JSON.stringify({ message: 'Permission error' }), {
      status: 403,
    })
  }
  const user_email = session?.user.email
  const id = params.id

  const dbm = new DatabaseManager()
  const client = await dbm.transactionStart()
  try {
    const dataset = await getDatasetById(client, id, user_email)
    if (!dataset) {
      return new Response(JSON.stringify({ message: `No dataset found.` }), {
        status: 404,
      })
    }

    const dsm = new DatasetManager(dataset)

    const permission = await dsm.getPermission(client, user_email)
    if (!(permission && permission === Permission.OWNER)) {
      return new Response(JSON.stringify({ message: `You don't have permission to delete this datasets.` }), {
        status: 403,
      })
    }

    await dsm.delete(client, dataset.properties.id)

    return new Response(undefined, {
      status: 204,
    })
  } catch (err) {
    await dbm.transactionRollback()
    throw err
  } finally {
    await dbm.transactionEnd()
  }
}
