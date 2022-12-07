import type { DataCategory, Layer } from '$lib/types'
import type { StyleDefinition } from '@undp-data/style-switcher'

export const COLOR_CLASS_COUNT = 5
export const COLOR_CLASS_COUNT_MAXIMUM = 25
export const COLOR_CLASS_COUNT_MINIMUM = 2
export const DEFAULT_LINE_WIDTH = 0.5
export const DEFAULT_TIMEOUT_MS = 60000
export const NO_RANDOM_SAMPLING_POINTS = 1000
export const SEARCH_PAGINATION_LIMIT = 25
export const TOKEN_EXPIRY_PERIOD_MSEC = 86400000 * 365 // for 1 year
export const STAC_MINIMUM_ZOOM = 5

export enum TabNames {
  ANALYZE = 'Analyze',
  DATA = 'Data',
  LABEL = 'Label',
  LAYERS = 'Layers',
  LEGEND = 'Legend',
  OPACITY = 'Opacity',
  TRANSFORM = 'Transform',
  STYLEJSON = 'Specification',
  ZOOM = 'Zoom',
  HISTOGRAM = 'Histogram',
  FILTER = 'Filter',
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
  dataset: undefined,
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

export const vectorFilterOperations = [
  { value: '==', label: 'Equals', text: 'is equal to', disabled: false, symbol: '=' },
  { value: '!=', label: 'Differs', text: 'is different then', disabled: false, symbol: '≠' },
  { value: '>', label: 'Larger', text: 'is larger then', disabled: false, symbol: '>' }, // < disabled when property is string
  { value: '<', label: 'Smaller', text: 'is smaller then', disabled: false, symbol: '<' }, // < disabled when property is string
  { value: 'in', label: 'Contains', text: 'contains', disabled: false, symbol: '⊂' },
  { value: '!in', label: 'Excludes', text: 'does not contain', disabled: false, symbol: '⊄' },
]
export const rasterComparisonOperators = [
  { value: '==', label: 'Equals', text: 'equal to', disabled: false, symbol: '=' },
  { value: '!=', label: 'Differs', text: 'different then', disabled: false, symbol: '≠' },
  { value: '>', label: 'Larger', text: 'larger than', disabled: false, symbol: '>' },
  { value: '<', label: 'Smaller', text: 'smaller than', disabled: false, symbol: '<' },
  { value: '>=', label: 'Larger or equal', text: 'larger than or equal to', disabled: false, symbol: '>=' },
  { value: '<=', label: 'Smaller or equal', text: 'smaller than or equal to', disabled: false, symbol: '<=' },
]

export const rasterArithmeticOperators = [
  { value: '+', label: 'Plus', text: 'addition', disabled: false, symbol: '+' },
  { value: '-', label: 'Minus', text: 'subtraction', disabled: false, symbol: '-' },
  { value: '*', label: 'Multiply', text: 'multiplication', disabled: false, symbol: '*' },
  { value: '/', label: 'Divide', text: 'division', disabled: false, symbol: '/' },
  { value: '%', label: 'Modulo', text: 'remainder of division', disabled: false, symbol: '%' },
  { value: '**', label: 'Power', text: 'raise to power', disabled: false, symbol: '^' },
]

export const DataCategories: DataCategory[] = [
  {
    name: 'SDG',
    icon: '/sdgs/SDG Wheel_WEB.png',
    url: '/api/tags?key=sdg_goal',
  },
  {
    name: 'Climate change',
    icon: '/sdgs/13.png',
    url: '/api/datasets?sdg_goal=13',
  },
  {
    name: 'Microsoft Planetary',
    icon: 'fa-brands fa-microsoft',
    url: '/api/datasets?stac=microsoft-pc',
  },
  {
    name: 'pg_tileserv',
    icon: '/crunchy-spatial-logo.png',
    url: '/api/datasets?type=pgtileserv',
  },
  {
    name: 'martin',
    icon: '/maplibre.png',
    url: '/api/datasets?type=martin',
  },
]

export const SortingColumns = [
  {
    column: 'name',
    label: 'Name',
  },
  {
    column: 'source',
    label: 'Source',
  },
  // {
  //   column: 'license',
  //   label: 'Data license'
  // },
  {
    column: 'updatedat',
    label: 'Updated date',
  },
  {
    column: 'createdat',
    label: 'Created date',
  },
]

export const DatasetSearchQueryParams = ['query', 'offset', 'limit', 'storage_id', 'bbox', 'sortby', 'operator']

export const tagSearchKeys = [
  {
    key: 'extent',
    label: 'Region',
  },
  {
    key: 'granularity',
    label: 'Admin Level',
  },
  {
    key: 'resolution',
    label: 'Resolution',
  },
  {
    key: 'year_value',
    label: 'Year',
  },
  {
    key: 'keyword',
    label: 'Keyword',
  },
  {
    key: 'sdg_target',
    label: 'SDG Topic',
  },
  {
    key: 'theme',
    label: 'Theme',
  },
]
