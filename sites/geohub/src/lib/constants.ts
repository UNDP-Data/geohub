export const COLOR_CLASS_COUNT = 5
export const COLOR_CLASS_COUNT_MAXIMUM = 25
export const COLOR_CLASS_COUNT_MINIMUM = 2
export const DEFAULT_LINE_WIDTH = 0.5
export const DEFAULT_TIMEOUT_MS = 60000
export const NO_RANDOM_SAMPLING_POINTS = 1000
export const SEARCH_PAGINATION_LIMIT = 25
export const TOKEN_EXPIRY_PERIOD_MSEC = 86400000 * 365 // for 1 year
export const STAC_MINIMUM_ZOOM = 5
export const UNIQUE_VALUE_THRESHOLD = 25

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
  SIMULATION = 'Simulation',
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

export enum ColorMapTypes {
  SEQUENTIAL = 'sequential',
  DIVERGING = 'diverging',
  QUALITATIVE = 'qualitative',
}

export enum LegendTypes {
  DEFAULT = 'default',
  CLASSIFY = 'classify',
}

export enum VectorApplyToTypes {
  COLOR = 'color',
  SIZE = 'size',
}

export enum DynamicLayerResolutionTypes {
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  AVERAGE = 'average',
}

export const DEFAULT_LIMIT = 10

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
