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
