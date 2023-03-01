import { ELECTRICITY_DATASETS } from '@undp-data/electricity-dashboard'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const datasets = JSON.parse(JSON.stringify(ELECTRICITY_DATASETS))

  for (const ds of datasets.hrea) {
    const res = await event.fetch(`/api/datasets/${ds.id}`)
    const json = await res.json()
    ds.url = json.properties.url
  }

  for (const ds of datasets.ml) {
    const res = await event.fetch(`/api/datasets/${ds.id}`)
    const json = await res.json()
    ds.url = json.properties.url
  }

  return {
    datasets,
  }
}
