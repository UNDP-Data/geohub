import type { StacLink } from './StacLink'
import type { StacAsset } from './StacAsset'

export interface StacItemFeature {
  type: 'Feature'
  stac_version: string
  id: string
  geometry: {
    type: string
    coordinates: [number, number] | [number, number][] | [number, number][][]
  }
  bbox: [number, number, number, number]
  properties: { [key: string]: string }
  links: StacLink[]
  assets: { [key: string]: StacAsset }
  collection?: string
}
