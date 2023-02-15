import type { Actions, PageServerLoad } from './$types'
import { error, fail } from '@sveltejs/kit'
import type { DatasetFeature, Tag } from '$lib/types'
import { generateHashKey, getRasterMetadata, getVectorMetadata, isRasterExtension } from '$lib/server/helpers'

export const load: PageServerLoad = async ({ locals, url }) => {
  const session = await locals.getSession()
  if (!session) throw error(403, { message: 'No permission' })

  const datasetUrl = url.searchParams.get('url')
  if (!datasetUrl) throw error(400, { message: `url on query param is required.` })

  const datasetId = generateHashKey(datasetUrl)

  const apiUrl = `${url.origin}/api/datasets/${datasetId}`
  const res = await fetch(apiUrl)
  if (!res.ok && res.status !== 404) throw error(500, { message: res.statusText })

  if (res.status === 404) {
    const is_raster = isRasterExtension(datasetUrl)
    const metadata = is_raster ? await getRasterMetadata(datasetUrl) : await getVectorMetadata(datasetUrl)
    const tags: Tag[] = []
    if (metadata.source) {
      tags.push({
        key: 'provider',
        value: metadata.source,
      })
    }
    const feature: DatasetFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [metadata.bounds[0], metadata.bounds[1]],
          [metadata.bounds[2], metadata.bounds[1]],
          [metadata.bounds[2], metadata.bounds[3]],
          [metadata.bounds[0], metadata.bounds[3]],
          [metadata.bounds[0], metadata.bounds[1]],
        ],
      },
      properties: {
        id: datasetId,
        url: datasetUrl,
        name: metadata.name,
        description: metadata.description,
        is_raster,
        tags,
      },
    }
    return {
      feature,
      isNew: true,
    }
  }

  const feature: DatasetFeature = await res.json()

  return {
    feature,
    isNew: false,
  }
}

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

      const id = data.get('id') as string
      const url = data.get('url') as string
      const is_raster = data.get('is_raster') === 'true' ? true : false
      const geometry = data.get('geometry') ? JSON.parse(data.get('geometry')) : ''

      const dataset: DatasetFeature = {
        type: 'Feature',
        geometry: geometry,
        properties: { id, url, name, license, description, is_raster, tags: tags },
      }
      return dataset
    } catch (error) {
      return fail(500, { status: error.status, message: 'error:' + error.message })
    }
  },
} satisfies Actions
