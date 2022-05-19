import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons/faDrawPolygon'
import { faBraille } from '@fortawesome/free-solid-svg-icons/faBraille'
import { faBacon } from '@fortawesome/free-solid-svg-icons/faBacon'
import { faBezierCurve } from '@fortawesome/free-solid-svg-icons/faBezierCurve'
// import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows'

export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_TIMEOUT_MS = 60000
export const STRING_COMPARE_THRESHOLD = 0.25
export const COLOR_CLASS_COUNT = 5
export const COLOR_CLASS_COUNT_MINIMUM = 2
export const COLOR_CLASS_COUNT_MAXIMUM = 25

export enum TabNames {
  ANALYZE = 'Analyze',
  BUCKETS = 'Buckets',
  LABEL = 'Label',
  LAYERS = 'Layers',
  LEGEND = 'Legend',
  OPACITY = 'Opacity',
  REFINE = 'Refine',
  STYLEJSON = 'Specification',
  ZOOM = 'Zoom',
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

export enum ClassificationMethodTypes {
  EQUIDISTANT = 'e',
  QUANTILE = 'q',
  LOGARITHMIC = 'l',
}

export enum ClassificationMethodNames {
  EQUIDISTANT = 'Equidistant',
  QUANTILE = 'Quantile',
  LOGARITHMIC = 'Logarithmic',
}

export const LayerInitialValues = {
  name: 'GeoHub',
  definition: undefined,
  type: '',
  info: {},
  colorMapName: DEFAULT_COLORMAP,
  continuous: {
    minimum: undefined,
    maximum: undefined,
  },
  intervals: {
    classification: ClassificationMethodTypes.EQUIDISTANT,
    numberOfClasses: COLOR_CLASS_COUNT,
  },
  expression: '',
  legendType: '',
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
    icon: faBacon,
    color: 'mediumpurple',
  },
  {
    id: 'polygon',
    label: 'Polygon',
    icon: faDrawPolygon,
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
    icon: faWindows,
    color: 'nightblue',
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
