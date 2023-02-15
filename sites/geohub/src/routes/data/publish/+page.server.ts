import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'
import type { Tag } from '$lib/types'

export const actions = {
  /**
   * An action to get SAS URL for data uploading
   */
  publish: async ({ request, locals }) => {
    try {
      const session = await locals.getSession()
      if (!session) {
        return fail(403, { message: 'No permission' })
      }
      const data = await request.formData()

      const name = data.get('name') as string
      if (!name) {
        return fail(400, { type: 'danger', message: 'Dataset name is required' })
      }

      const license = data.get('license') as string
      if (!license) {
        return fail(400, { type: 'warning', message: 'License is required' })
      }

      const description = data.get('description') as string
      if (!description) {
        return fail(400, { type: 'warning', message: 'Dataset description is required' })
      }

      const tagsStr = data.get('tags') as string
      const tags: Tag[] = tagsStr ? JSON.parse(tagsStr) : ''

      if (tags.filter((t) => t.key === 'provider').length === 0) {
        return fail(400, { type: 'warning', message: 'Data provider is required' })
      }

      const dataset = { name, license, description, tags: tags }
      return dataset
    } catch (error) {
      return fail(500, { status: error.status, message: 'error:' + error.message })
    }
  },
} satisfies Actions
