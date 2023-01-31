import type { ClassificationMethodTypes } from '$lib/constants'
import type { RasterTileMetadata } from './RasterTileMetadata'
import type { StacItemFeature } from './StacItemFeature'
import type { VectorTileMetadata } from './VectorTileMetadata'

export interface Layer {
  id: string
  name: string
  info?: RasterTileMetadata | VectorTileMetadata
  children?: Layer[]
  parentId?: string
  dataset: StacItemFeature
  colormapName?: string
  classificationMethod?: ClassificationMethodTypes
}
