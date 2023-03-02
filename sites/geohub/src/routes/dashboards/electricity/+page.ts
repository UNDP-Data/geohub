import { ELECTRICITY_DATASETS, type Dataset } from '@undp-data/electricity-dashboard'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  const datasets = ELECTRICITY_DATASETS

  const hrea: Promise<Dataset>[] = []

  for (const ds of datasets.hrea) {
    hrea.push(
      new Promise<Dataset>((resolve) => {
        fetch(`/api/datasets/${ds.id}`)
          .then((res) => res.json())
          .then((data) => {
            ds.url = data.properties.url
            resolve(ds)
          })
      }),
    )
  }

  const ml: Promise<Dataset>[] = []

  for (const ds of datasets.ml) {
    ml.push(
      new Promise<Dataset>((resolve) => {
        fetch(`/api/datasets/${ds.id}`)
          .then((res) => res.json())
          .then((data) => {
            ds.url = data.properties.url
            resolve(ds)
          })
      }),
    )
  }

  const hreaData = await Promise.all(hrea)
  const mlData = await Promise.all(ml)

  return {
    datasets: {
      hrea: hreaData,
      ml: mlData,
    },
  }
}

export const csr = true
export const ssr = false
