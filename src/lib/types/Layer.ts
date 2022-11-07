import type { IntervalLegend } from './IntervalLegend'
import type { RasterTileMetadata } from './RasterTileMetadata'
import type { TreeNode } from './TreeNode'
import type { VectorTileMetadata } from './VectorTileMetadata'

export interface Layer {
  id: string
  name: string
  info?: RasterTileMetadata | VectorTileMetadata
  intervals?: IntervalLegend
  children?: Layer[]
  parent?: Layer
  legendType?: string
  tree?: TreeNode
}
