import type { AccessLevel } from '$lib/config/AppConfig'
import type { StyleSpecification } from 'maplibre-gl'
import type { Layer } from './Layer'

export interface SavedMapStyle {
  id: number
  name: string
  style: StyleSpecification
  layers: Layer[]
  createdat: string
  created_user: string
  updatedat: string
  updated_user: string
  access_level: AccessLevel
  readOnly?: boolean
}
