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
import type { VectorTileMetadata } from './VectorTileMetadata'

export interface Layer {
  id: string
  name: string
  definition:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  info?: RasterTileMetadata | VectorTileMetadata
  colorMapName?: string
  intervals?: IntervalLegend
  children?: Layer[]
  parent?: Layer
  legendType?: string
  tree?: TreeNode
}
