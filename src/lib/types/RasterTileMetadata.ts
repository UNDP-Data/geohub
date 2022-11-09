import type { BandMetadata } from './BandMetadata'
import type { RasterLayerStats } from './RasterLayerStats'

export interface RasterTileMetadata {
  band_descriptions?: string[]
  band_metadata?: string[] | BandMetadata[]
  bounds?: [] | string
  colorinterp?: []
  count?: number
  driver?: string
  dtype?: string
  nodata_type?: string
  overviews?: []
  stats?: RasterLayerStats
  active_band_no?: string
}
