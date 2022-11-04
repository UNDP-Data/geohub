import type {
  RasterLayerSpecification,
  LineLayerSpecification,
  FillLayerSpecification,
  SymbolLayerSpecification,
  HeatmapLayerSpecification,
} from 'maplibre-gl'
import type { IntervalLegend } from './IntervalLegend'
import type { RasterTileMetadata } from './RasterTileMetadata'
import type { TreeNode } from './TreeNode'
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
  colorMapName?: string
  intervals?: IntervalLegend
  unique?: UniqueLegend
  expression?: string
  expressions?: [] // This is to maintain the state of the expression editor. Different from expression.
  simpleExpressionAvailable?: boolean
  children?: Layer[]
  parent?: Layer
  legendType?: string
  tree?: TreeNode
}
