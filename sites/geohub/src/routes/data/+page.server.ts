import type { PageServerLoad } from './$types'
import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types'
import { DEFAULT_LIMIT } from '$lib/constants'
import { redirect } from '@sveltejs/kit'
import { DatasetSortingColumns } from '$lib/AppConfig'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  if (!session) return {}

  const apiUrl = new URL(url)

  // reset default query params if it is not in queryparams
  const queryoperator = url.searchParams.get('queryoperator')
  if (!queryoperator) {
    apiUrl.searchParams.set('queryoperator', 'and')
  }
  const operator = url.searchParams.get('operator')
  if (!operator) {
    apiUrl.searchParams.set('operator', 'and')
  }
  const sortby = url.searchParams.get('sortby')
  if (!sortby) {
    apiUrl.searchParams.set('sortby', DatasetSortingColumns.find((col) => col.value === 'updatedat,desc').value)
  }
  const limit = url.searchParams.get('limit')
  if (!limit) {
    apiUrl.searchParams.set('limit', `${DEFAULT_LIMIT}`)
  }

  const offset = url.searchParams.get('offset')
  if (!offset) {
    apiUrl.searchParams.set('offset', `0`)
  }

  if (apiUrl.search !== url.search) {
    throw redirect(300, `${apiUrl.pathname}${apiUrl.search}`)
  }

  // only azure's user data is avalable for data page
  apiUrl.searchParams.set('type', 'azure')
  // only allow user owned data is available for data page
  apiUrl.searchParams.set('mydata', 'true')

  const res = await event.fetch(`/api/datasets${apiUrl.search}`)
  const datasets: DatasetFeatureCollection = await res.json()

  const resIngesting = await event.fetch(`/api/datasets/ingesting`)
  const ingestingDatasets: IngestingDataset[] = await resIngesting.json()

  return {
    datasets,
    ingestingDatasets,
  }
}
