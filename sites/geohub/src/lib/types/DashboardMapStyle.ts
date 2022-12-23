import type { Layer } from './Layer'

export interface DashboardMapStyle {
  id: string
  name: string
  createdat: string
  updatedat: string
  layers?: Layer[]
  style?: string
  viewer?: string
  editor?: string
}
