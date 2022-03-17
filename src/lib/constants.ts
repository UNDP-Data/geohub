import type { TreeNode } from '../lib/types'

export enum TabNames {
  LoadData = 'Load data',
  Layers = 'Layers',
  Analyze = 'Analyze',
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
  UndefinedBandMetadatalayerMinMax = 'Missing layer minimum and/or maximum metadata values.',
}
