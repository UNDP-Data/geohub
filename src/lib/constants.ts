import { faShapes } from '@fortawesome/free-solid-svg-icons/faShapes'
import { faBraille } from '@fortawesome/free-solid-svg-icons/faBraille'
import { faWaveSquare } from '@fortawesome/free-solid-svg-icons/faWaveSquare'
import { faBezierCurve } from '@fortawesome/free-solid-svg-icons/faBezierCurve'
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage'

import type { TreeNode } from '../lib/types'

export enum TabNames {
  LOAD_DATA = 'Load data',
  LAYERS = 'Layers',
  ANALYZE = 'Analyze',
}

export const TreeNodeInitialValues = {
  label: 'GeoHub Storage',
  children: <TreeNode[]>[],
  path: '/',
  url: null,
  isRaster: false,
}

export const LayerInitialValues = {
  name: '',
  definition: {},
  type: '',
  info: {},
}

export enum ErrorCodes {
  UNDEFINED_BAND_METADATA_LAYER_MINMAX = 'Missing layer minimum and/or maximum metadata values.',
}

export enum BannerTypes {
  ERROR = 'Error',
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
  CONTINUOUS = 'continuous',
  BUCKETED = 'bucketed',
}

export enum DynamicLayerResolutionTypes {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  AVERAGE = 'average',
}

export enum LayerTypes {
  RASTER = 'raster',
  VECTOR = 'vector',
}
