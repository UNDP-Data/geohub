import type { StatusTypes } from '$lib/constants'

export interface BannerMessage {
  type: StatusTypes
  title: string
  message: string
  error?: Error
}
