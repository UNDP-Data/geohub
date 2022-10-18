import type {
  RasterLayerSpecification,
  LineLayerSpecification,
  FillLayerSpecification,
  SymbolLayerSpecification,
  HeatmapLayerSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl'
import type { ContinuousLegend } from './ContinuousLegend'
import type { IntervalLegend } from './IntervalLegend'
import type { RasterTileMetadata } from './RasterTileMetadata'
import type { UniqueLegend } from './UniqueLegend'
import type { VectorTileMetadata } from './VectorTileMetadata'

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
