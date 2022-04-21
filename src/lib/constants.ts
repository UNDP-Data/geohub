import { faShapes } from '@fortawesome/free-solid-svg-icons/faShapes'
import { faBraille } from '@fortawesome/free-solid-svg-icons/faBraille'
import { faWaveSquare } from '@fortawesome/free-solid-svg-icons/faWaveSquare'
import { faBezierCurve } from '@fortawesome/free-solid-svg-icons/faBezierCurve'
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage'

import type { TreeNode } from '$lib/types'

export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_TIMEOUT_MS = 60000

export enum TabNames {
  ANALYZE = 'Analyze',
  BUCKETS = 'Buckets',
  LABEL = 'Label',
  LAYERS = 'Layers',
  LEGEND = 'Legend',
  LOAD_DATA = 'Load data',
  OPACITY = 'Opacity',
  REFINE = 'Refine',
  STYLEJSON = 'Specification',
  ZOOM = 'Zoom',
}

export const TreeNodeInitialValues = {
  id: null,
  label: 'GeoHub Storage',
  children: <TreeNode[]>[],
  path: '/',
  url: null,
  isRaster: false,
}

export const BucketIntialValues = {
  id: '',
  published: true,
  path: '',
  label: '',
  description: '',
  icon: '',
  type: '',
  tags: [],
}

export const LayerInitialValues = {
  name: '',
  definition: undefined,
  type: '',
  info: {},
}

export enum ErrorMessages {
  UNDEFINED_BAND_METADATA_LAYER_MINMAX = 'Missing layer minimum and/or maximum metadata values.',
  FETCH_TIMEOUT = 'The request took longer than expected. Please try again later.',
}
export const LayerIconTypes = [
  {
    id: 'point',
    label: 'Point',
    icon: faBraille,
    color: 'lightseagreen',
  },
  {
    id: 'line',
    label: 'Line',
    icon: faWaveSquare,
    color: 'mediumpurple',
  },
  {
    id: 'polygon',
    label: 'Polygon',
    icon: faShapes,
    color: 'crimson',
  },
  {
    id: 'vector',
    label: 'Vector',
    icon: faBezierCurve,
    color: 'peru',
  },
  {
    id: 'raster',
    label: 'Raster',
    icon: faImage,
    color: 'dodgerblue',
  },
]

export enum ColorMapTypes {
  SEQUENTIAL = 'sequential',
  DIVERGING = 'diverging',
  QUALITATIVE = 'qualitative',
}

export enum DynamicLayerLegendTypes {
  BUCKETED = 'bucketed',
  CONTINUOUS = 'continuous',
  UNIQUE = 'unique',
  INTERVALS = 'intervals',
}

export enum DynamicLayerResolutionTypes {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  AVERAGE = 'average',
}

export enum LayerTypes {
  RASTER = 'raster',
  VECTOR = 'vector',
  SYMBOL = 'symbol',
  LINE = 'line',
  FILL = 'fill',
  HEATMAP = 'heatmap',
}

export enum ClassificationMethodTypes {
  EQUIDISTANT = 'e',
  QUANTILE = 'q',
  LOGARITHMIC = 'l',
}

export enum StatusTypes {
  PRIMARY = 'primary',
  LINK = 'link',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
}

export enum BucketType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}
