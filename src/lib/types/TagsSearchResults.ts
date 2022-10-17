import type { TagLayer } from './TagLayer'

export interface TagsSearchResults {
  tags: string[]
  blobCount: number
  containerCount: number
  results: {
    blobs: TagLayer[]
    containers: string[]
  }
  responseTime: number
}
