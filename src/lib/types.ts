import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { BucketType } from '$lib/constants'
import type {
  RasterLayerSpecification,
  LineLayerSpecification,
  FillLayerSpecification,
  SymbolLayerSpecification,
  HeatmapLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import type { ClassificationMethodTypes, StatusTypes } from './constants'

export interface Tree {
  tree: TreeNode
}

export interface TreeNode {
  id?: string
  label?: string
  children?: Array<TreeNode>
  path?: string
  prefix?: string
  url?: string
  isRaster?: boolean
  geomType?: string
  metadata?: VectorTileMetadata
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LayerList extends Array<Layer> {}

export interface Layer {
  name: string
  definition:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  type?: string
  info?: LayerInfo | VectorTileMetadata
  visible?: boolean | true
  url?: string
  features?: []
  colorMapName?: string
  continuous?: ContinuousLegend
  intervals?: IntervalLegend
  unique?: UniqueLegend
}

export interface ContinuousLegend {
  minimum: number
  maximum: number
}

export interface IntervalLegend {
  classification?: ClassificationMethodTypes
  numberOfClasses?: number
  colorMapRows?: IntervalLegendColorMapRow[]
}

export interface UniqueLegend {
  colorMapRows?: IntervalLegendColorMapRow[]
}

export interface UniqueLegendColorMapRow {
  value: number
  name: string
}

export interface IntervalLegendColorMapRow {
  index?: number
  color?: number[]
  start?: number
  end?: number | string
}

export interface LayerInfo {
  band_descriptions?: string[]
  band_metadata?: string[]
  bounds?: [] | string
  colorinterp?: []
  count?: number
  driver?: string
  dtype?: string
  height?: number
  maxzoom?: number
  minzoom?: number
  nodata_type?: string
  nodata_value?: number
  overviews?: []
  width?: number
}

export interface VectorLayerMetadata {
  id: string
  fields: {
    [key: string]: string
  }
  description?: string
  minzoom?: number
  maxzoom?: number
}

// https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
export interface VectorTileMetadata {
  name: string
  format: 'pbf'
  bounds: string
  center: string
  minzoom: number
  maxzoom: number
  attribution?: string
  description?: string
  type?: string
  version?: string
  json?: {
    vector_layers: VectorLayerMetadata[]
    tilestats?: {
      layerCount: number
      layers: [
        {
          layer: string
          geometry: string
          count: number
          attributeCount: number
          attributes: {
            attribute: string
            count: number
            type: string
            values: string[] | number[]
          }
        },
      ]
    }
  }
  band_metadata?: string[]
}

export interface LayerInfoMetadata {
  source?: string
  description?: string
  unit?: string
}

export interface Error {
  code: string
}

export interface LayerIcon {
  id: string
  label: string
  icon: IconProp
  color: string
}

export interface SpriteIcon {
  width: number
  height: number
  x: number
  y: number
  pixelRatio: number
}

export interface SpriteImage {
  src: string
  alt: string
}

export interface Sprite {
  dataUrl: string
  json: JSON
}

export interface BannerMessage {
  type: StatusTypes
  title: string
  message: string
}

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
}

export interface Color {
  r: number
  g: number
  b: number
  a?: number
  hex: string
  h: number
  s: number
  v: number
}

export interface StyleDefinition {
  title: string
  uri: string
}
