import type { Layer, StyleDefinition } from '$lib/types'

export const COLOR_CLASS_COUNT = 5
export const COLOR_CLASS_COUNT_MAXIMUM = 25
export const COLOR_CLASS_COUNT_MINIMUM = 2
export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_FILL_COLOR = 'rgba(20, 180, 60, 1)'
export const DEFAULT_LINE_COLOR = 'rgba(53, 175, 109, 1)'
export const DEFAULT_LINE_WIDTH = 0.5
export const DEFAULT_FILL_OUTLINE_COLOR = 'rgba(110, 110, 110, 1)'
export const DEFAULT_TIMEOUT_MS = 60000
export const NO_RANDOM_SAMPLING_POINTS = 1000
export const STRING_COMPARE_THRESHOLD = 0.25
export const STAC_PAGINATION_PREV = 'prev'
export const STAC_PAGINATION_NEXT = 'next'
export const STAC_PAGINATION_LIMIT = 5
export const TOKEN_EXPIRY_PERIOD_MSEC = 86400000 * 365 // for 1 year

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

export const LayerInitialValues: Layer = {
  id: '',
  name: 'GeoHub',
  info: {},
  intervals: {
    classification: ClassificationMethodTypes.EQUIDISTANT,
    numberOfClasses: COLOR_CLASS_COUNT,
  },
  legendType: '',
}

export enum ErrorMessages {
  UNDEFINED_BAND_METADATA_LAYER_MINMAX = 'Missing layer minimum and/or maximum metadata values.',
  FETCH_TIMEOUT = 'The request took longer than expected. Please try again later.',
  NO_LAYER_WITH_THAT_NAME = "We couldn't find a layer with that name.",
  VECTOR_INFO_BAD_REQUEST = 'Bad request. Please verify the URL and/or parameters.',
  MAP_FILTER_NOT_APPLIED = 'The map filter was not applied. Please check the that all filters are valid.',
  EXPRESSION_INVALID = 'The Raster Expression appears to be Invalid. Please check it and try again.',
  NO_STYLE_EXISTS = 'No style id exists in the database',
  FAILED_TO_PARSE_METADATA = 'Failed to parse JSON from metadata',
  COMPONENT_NOT_RENDERED = 'Step Component cannot be rendered outside the Wizard component',
  TOO_SMALL_ZOOM_LEVEL = 'Please zoom in more than zoom level: 5 in order to load the layer',
}
export const LayerIconTypes = [
  {
    id: 'point',
    label: 'Point',
    icon: 'fa-solid fa-cubes-stacked',
    color: 'lightseagreen',
  },
  {
    id: 'symbol',
    label: 'Symbol',
    icon: 'fa-solid fa-cubes-stacked',
    color: 'lightseagreen',
  },
  {
    id: 'line',
    label: 'Line',
    icon: 'fa-solid fa-bacon',
    color: 'mediumpurple',
  },
  {
    id: 'polygon',
    label: 'Polygon',
    icon: 'fa-solid fa-vector-square',
    color: 'crimson',
  },
  {
    id: 'fill',
    label: 'Polygon',
    icon: 'fa-solid fa-vector-square',
    color: 'crimson',
  },
  {
    id: 'vector',
    label: 'Vector',
    icon: 'fa-solid fa-bezier-curve',
    color: 'peru',
  },
  {
    id: 'raster',
    label: 'Raster',
    icon: 'fa-brands fa-windows',
    color: '#0b0b45',
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    icon: 'fa-solid fa-braille',
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

export const vectorFilterOperations = [
  { value: '==', label: 'Equals', text: 'is equal to', disabled: false, symbol: '=' },
  { value: '!=', label: 'Differs', text: 'is different then', disabled: false, symbol: '≠' },
  { value: '>', label: 'Larger', text: 'is larger then', disabled: false, symbol: '>' }, // < disabled when property is string
  { value: '<', label: 'Smaller', text: 'is smaller then', disabled: false, symbol: '<' }, // < disabled when property is string
  { value: 'in', label: 'Contains', text: 'contains', disabled: false, symbol: '⊂' },
  { value: '!in', label: 'Excludes', text: 'does not contain', disabled: false, symbol: '⊄' },
]
