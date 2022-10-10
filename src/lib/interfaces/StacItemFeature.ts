export interface StacItemFeature {
  id: string
  bbox: number[]
  type: 'Feature'
  links: {
    rel: string
    type: string
    href: string
  }[]
  assets: {
    [key: string]: {
      href: string
      'proj:bbox': number[]
      'proj:shape': number[]
      'proj:transform': number[]
      title: string
      type: string
      roles: string[]
      gsd: number
    }
  }
  geometry: GeoJSON.Geometry
  collection: string
  properties: { [key: string]: string | number }
  stac_extensions: string[]
  stac_version: string
}
