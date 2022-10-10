import type { StacItemFeature } from './StacItemFeature'

export interface StacItemFeatureCollection {
  type: 'FeatureCollection'
  features: StacItemFeature[]
  links: {
    rel: string
    type: string
    href: string
    method?: string
    body?: { [key: string]: string }
  }[]
}
