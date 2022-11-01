import fs from 'fs'
import path from 'path'
import type { Bucket } from '$lib/types'
import type { PageServerLoad } from './$types'
const __dirname = path.resolve()

export const load: PageServerLoad = async ({ url }) => {
  const promises = [
    getExternalContainers(`${__dirname}/data/external-buckets.json`),
    getAzureBlobContainers(url)
  ]

  const data = await Promise.all(promises)
  let buckets: Bucket[] = []
  data.forEach((bucket) => {
    buckets = [...buckets, ...bucket]
  })
  return {
    buckets,
  }
}

const getAzureBlobContainers = async (url: URL) => {
  const res = await fetch(`${url.origin}/azstorage/containers`)
  const containers: Bucket[] = await res.json()
  return containers
}

const getExternalContainers = (filePath: string): Bucket[] => {
  if (!fs.existsSync(filePath)) return []
  const containers: Bucket[] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return containers
}
