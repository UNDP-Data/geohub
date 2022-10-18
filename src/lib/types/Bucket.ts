import type { BucketType } from '$lib/constants'

export interface Bucket {
  id: string
  published: boolean
  path: string
  label: string
  description: string | null
  icon: string | null
  type: BucketType
  tags: string[]
  selected?: boolean | false
  items?: []
  url?: string
  sdg?: number
}
