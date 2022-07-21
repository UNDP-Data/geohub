import { faBacon } from '@fortawesome/free-solid-svg-icons/faBacon'
import { faBezierCurve } from '@fortawesome/free-solid-svg-icons/faBezierCurve'
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows'
import { faCubesStacked } from '@fortawesome/free-solid-svg-icons/faCubesStacked'
import { faVectorSquare } from '@fortawesome/free-solid-svg-icons/faVectorSquare'
import { faBraille } from '@fortawesome/free-solid-svg-icons/faBraille'
import type { StyleDefinition } from '$lib/types'

export const COLOR_CLASS_COUNT = 5
export const COLOR_CLASS_COUNT_MAXIMUM = 25
export const COLOR_CLASS_COUNT_MINIMUM = 2
export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_FILL_COLOR = 'rgba(110, 110, 110, 1)'
export const DEFAULT_LINE_COLOR = 'rgba(53, 175, 109, 1)'
export const DEFAULT_TIMEOUT_MS = 60000
export const NO_RANDOM_SAMPLING_POINTS = 1000
export const STRING_COMPARE_THRESHOLD = 0.25
export const TITILER_API_ENDPOINT = import.meta.env.VITE_TITILER_ENDPOINT
export const STAC_PAGINATION_PREV = 'prev'
export const STAC_PAGINATION_NEXT = 'next'
export const STAC_PAGINATION_LIMIT = 15
export const MARTIN_API_ENDPOINT = import.meta.env.VITE_MARTIN_API_ENDPOINT

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
  TAGS = 'Search',
  HISTOGRAM = 'Histogram',
  FILTER = 'Filter',
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
  NATURAL_BREAK = 'n',
}

export enum ClassificationMethodNames {
  EQUIDISTANT = 'Equidistant',
  QUANTILE = 'Quantile',
  LOGARITHMIC = 'Logarithmic',
  NATURAL_BREAK = 'Natural Breaks',
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
  simpleExpressionAvailable: true,
  percentile98: undefined,
  iconColor: DEFAULT_LINE_COLOR,
  fillColor: DEFAULT_FILL_COLOR,
  fillOutlineColor: DEFAULT_LINE_COLOR,
}

export enum ErrorMessages {
  UNDEFINED_BAND_METADATA_LAYER_MINMAX = 'Missing layer minimum and/or maximum metadata values.',
  FETCH_TIMEOUT = 'The request took longer than expected. Please try again later.',
  NO_LAYER_WITH_THAT_NAME = "We couldn't find a layer with that name.",
  VECTOR_INFO_BAD_REQUEST = 'Bad request. Please verify the URL and/or parameters.',
  MAP_FILTER_NOT_APPLIED = 'The map filter was not applied. Please check the that all filters are valid.',
}
export const LayerIconTypes = [
  {
    id: 'point',
    label: 'Point',
    icon: faCubesStacked,
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
    icon: faVectorSquare,
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
    color: '#0b0b45',
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    icon: faBraille,
    color: 'crimson',
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

export enum VectorLayerSymbolLegendTypes {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export enum VectorLayerSymbolLegendApplyToTypes {
  ICON_COLOR = 'Icon color',
  ICON_SIZE = 'Icon size',
}

export enum VectorLayerLineLegendTypes {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export enum VectorLayerPolygonLegendTypes {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
}

export enum VectorLayerLineLegendApplyToTypes {
  LINE_COLOR = 'Line color',
  LINE_WIDTH = 'Line width',
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

export const styles: StyleDefinition[] = [
  {
    title: 'Carto',
    uri: 'https://undp-data.github.io/style/style.json',
  },
  {
    title: 'Bing Aerial',
    uri: 'https://undp-data.github.io/style/aerialstyle.json',
  },
]

export const TagKeys = [
  'sdg_goal',
  'sdg_target',
  'theme',
  'extent',
  'resolution',
  'granularity',
  'year_value',
  'name1',
  'name2',
  'name3',
]
