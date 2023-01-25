import type { Layer } from './Layer'

export interface DashboardMapStyle {
  id: string
  name: string
  createdat: string
  updatedat: string
  layers?: Layer[]
  access_level: number
  created_user: string
  updated_user: string
  style?: string
  viewer?: string
  editor?: string
}
