import type { RasterTileMetadata } from './RasterTileMetadata'
import type { TreeNode } from './TreeNode'
import type { VectorTileMetadata } from './VectorTileMetadata'

export interface Layer {
  id: string
  name: string
  info?: RasterTileMetadata | VectorTileMetadata
  children?: Layer[]
  parent?: Layer
  tree?: TreeNode
}
