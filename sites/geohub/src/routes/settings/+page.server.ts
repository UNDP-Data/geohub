import { fail } from '@sveltejs/kit'

export const actions = {
  default: async (event) => {
    const { request, locals } = event
    const session = await locals.getSession()
    if (!session) {
      return fail(403, { message: 'No permission' })
    }
    const data = await request.formData()
    const settings = {}
    for (const [key, value] of data.entries()) {
      settings[key] = value
    }
    const response = await event.fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })
    if (response.ok) {
      return {
        status: 200,
        body: { message: 'Settings saved' },
      }
    }
    return fail(500, { message: 'Failed to save settings' })
  },
}

export const load = async (event) => {
  const { locals } = event
  const session = await locals.getSession()
  if (!session) {
    return fail(403, { message: 'No permission' })
  }
  try {
    const response = await event.fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      return {
        status: 200,
        settings: data[0].settings,
      }
    }
  } catch (err) {
    return {
      status: 500,
      body: { message: err.message },
    }
  }
}
