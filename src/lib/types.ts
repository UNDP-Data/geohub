import type { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface Tree {
  tree: TreeNode
}

export interface TreeNode {
  label?: string
  children?: Array<TreeNode>
  path?: string
  prefix?: string
  url?: string
  isRaster?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LayerList extends Array<Layer> {}

export interface Layer {
  name: string
  definition: LayerDefinition
  type?: string
  info?: LayerInfo
  visible?: boolean | true
  url?: string
}

export interface LayerDefinition {
  id?: string
  type?: string
  source?: string
  minzoom?: number
  maxzoom?: number
  layout?: LayerVisibility
  'source-layer'?: string
  paint?: LayerPaint
}

export interface LayerVisibility {
  visibility: string
  'line-cap'?: string
  'line-join'?: string
}

export interface LayerPaint {
  'line-color'?: string
  'line-width'?: number
  'fill-color'?: string
  'fill-outline-color'?: string
  'fill-opacity'?: number
}

export interface LayerInfo {
  band_descriptions?: string[]
  band_metadata?: string[]
  bounds?: []
  colorinterp?: []
  count?: number
  driver?: string
  dtype?: string
  height?: number
  maxzoom?: number
  minzoom?: number
  nodata_type?: string
  nodata_value?: number
  overviews?: []
  width?: number
}

export interface Error {
  code: string
}

export interface LayerIcon {
  id: string
  label: string
  icon: IconProp
  color: string
}
