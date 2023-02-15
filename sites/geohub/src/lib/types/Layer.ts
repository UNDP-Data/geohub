import type { ClassificationMethodTypes } from '$lib/constants'
import type { RasterTileMetadata } from './RasterTileMetadata'
import type { DatasetFeature } from './DatasetFeature'
import type { VectorTileMetadata } from './VectorTileMetadata'

export interface Layer {
  id: string
  name: string
  info?: RasterTileMetadata | VectorTileMetadata
  children?: Layer[]
  parentId?: string
  dataset: DatasetFeature
  colorMapName?: string
  classificationMethod?: ClassificationMethodTypes
}
