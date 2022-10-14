export interface Stac {
  description: string
  icon: string
  id: string
  label: string
  path: string
  published: boolean
  selected: boolean
  tags: string[]
  type: string
  url: string
}

// https://planetarycomputer.microsoft.com/api/stac/v1/collections
export interface StacCollection {
  id: string
  type: string
  links: {
    rel: string
    type: string
    href: string
  }[]
  title: string
  assets: {
    [key: string]: {
      href: string
      type: string
      roles: string[]
      title: string
    }
  }
  extent: {
    spatial: {
      bbox: number[][]
    }
    temporal: {
      interval: string[][]
    }
  }
  license: string
  'sci:doi': string
  keywords: string
  providers: {
    url: string
    name: string
    roles: string[]
  }[]
  description: string
  stac_version: string
  item_assets?: {
    [key: string]: {
      title: string
      type: string
      roles: string[]
      gsd: number
    }
  }
  stac_extensions: string[]
  'msft:container'?: string
  'msft:storage_account'?: string
  'msft:short_description'?: string
}

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
