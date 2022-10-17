import type { VectorTileMetadata } from './VectorTileMetadata'

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
  collectionUrl?: string
}
