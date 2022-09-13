import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'
import type { BucketType } from '$lib/constants'
import type {
  RasterLayerSpecification,
  LineLayerSpecification,
  FillLayerSpecification,
  SymbolLayerSpecification,
  HeatmapLayerSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from '@maplibre/maplibre-gl-style-spec/types.g'
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
  tags?: string[]
  isStac?: boolean
  isMartin?: boolean
  paginationDirectionDisabled?: string
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
  info?: RasterTileMetadata | VectorTileMetadata
  visible?: boolean | true
  url?: string
  features?: []
  colorMapName?: string
  continuous?: ContinuousLegend
  intervals?: IntervalLegend
  unique?: UniqueLegend
  expression?: string
  expressions?: [] // This is to maintain the state of the expression editor. Different from expression.
  simpleExpressionAvailable?: boolean
  children?: Layer[]
  parent?: Layer
  legendType?: string
  source?: VectorSourceSpecification | RasterSourceSpecification
  iconSize?: number
  iconColor?: string
  lineWidth?: number
  fillColor?: string
  fillOutlineColor?: string
  zoomLevel?: number
  percentile98?: number
}

export interface BandStatistics {
  min: number
  max: number
  mean: number
  count: number
  sum: number
  std: number
  median: number
  majority: number
  minority: number
  unique: number
  histogram: []
  valid_percent: number
  masked_pixels: number
  valid_pixels: number
  percentile_98: number
  percentile_2: number
}

export interface ContinuousLegend {
  minimum: number
  maximum: number
}

export interface IntervalLegend {
  classification?: ClassificationMethodTypes
  numberOfClasses?: number
  colorMapRows?: IntervalLegendColorMapRow[]
  propertyName?: string
  applyToOption?: string
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
  start?: number | string
  end?: number | string
}

export interface HeatmapColorRow {
  index?: number
  color?: Color
  value?: number
}

export interface RasterTileMetadata {
  band_descriptions?: string[]
  band_metadata?: string[] | BandMetadata[]
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
  stats?: RasterLayerStats
  active_band_no: string
  classesMap: object
}

export interface BandMetadata {
  STATISTICS_MAXIMUM?: number
  STATISTICS_MEAN?: number
  STATISTICS_MINIMUM: number
  STATISTICS_STDDEV: number
  STATISTICS_VALID_PERCENT: number
}

export interface RasterLayerStats {
  [band_no: string]: BandStatistics
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
      layers: VectorLayerTileStatLayer[]
    }
  }
  band_metadata?: string[]
  nodata_value?: number
  stats?: VectorLayerTileStatAttribute[]
}

export interface VectorLayerTileStatLayer {
  layer: string
  geometry: string
  count: number
  attributeCount: number
  attributes: VectorLayerTileStatAttribute[]
}

export interface VectorLayerTileStatAttribute {
  attribute: string
  count: number
  type: string
  values: string[] | number[]
  min?: number
  max?: number
  histogram?: {
    bins: number[]
    count: number[]
  }
}

export interface LayerInfoMetadata {
  source?: string
  description?: string
  unit?: string
}

// export interface Error {
//   code: string
// }

export interface Layericon {
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
  error?: Error
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
  items?: []
  url?: string
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

export interface TagsSearchResults {
  tags: string[]
  blobCount: number
  containerCount: number
  results: {
    blobs: TagLayer[]
    containers: string[]
  }
  responseTime: number
}

export interface TagLayer {
  label: string
  path: string
  url: string
  isRaster: boolean
  geomType: string
  container: string
  tags: string[]
}

export interface OperatorCategory {
  name: string
  title: string
  icon: IconDefinition
  operators: Array<string>
  isVisible: boolean
}

export interface MartinLayerMetadata {
  id: string
  schema: string
  table: string
  srid: number
  geometry_column: string
  bounds: number[]
  extent: number
  buffer: number
  geometry_type: string
  properties: { [key: string]: string }
}

export type ArithmeticOperator = '*' | '/' | '+' | '-' | '%' | '**'

export interface RasterSimpleExpression {
  band: string
  operator: ArithmeticOperator
  value: number
}
