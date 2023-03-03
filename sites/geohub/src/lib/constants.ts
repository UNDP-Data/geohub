import type { StyleDefinition } from '@undp-data/style-switcher'
import type { Breadcrumb, Radio } from '@undp-data/svelte-undp-design'
import type { AcceptedExtension } from './types'

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

export const MAP_ATTRIBUTION =
  '<a target="_top" rel="noopener" href="http://undp.org">United Nations Development Programme (UNDP)</a>'

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

export enum LayerTypes {
  RASTER = 'raster',
  VECTOR = 'vector',
  SYMBOL = 'symbol',
  LINE = 'line',
  FILL = 'fill',
  HEATMAP = 'heatmap',
}

export enum AccessLevel {
  PRIVATE = 1,
  ORGANIZATION = 2,
  PUBLIC = 3,
}

export const LimitOptions = [5, 10, 25, 50, 100]
export const DEFAULT_LIMIT = 10

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

export const DataCategories: Breadcrumb[] = [
  {
    name: 'SDG',
    icon: 'assets/sdgs/SDG Wheel_WEB.png',
    url: '/api/tags?key=sdg_goal',
  },
  {
    name: 'UNDP',
    icon: 'assets/undp-images/undp-logo.png',
    url: '/api/datasets?provider=undp',
  },
  {
    name: 'Microsoft Planetary',
    icon: 'assets/microsoft.png',
    url: '/api/datasets?stac=microsoft-pc',
  },
  {
    name: 'Dynamic vector data',
    icon: 'assets/postgresql.png',
    url: '/api/datasets?type=pgtileserv',
  },
  {
    name: 'Favourite',
    icon: 'assets/star.png',
    url: '/api/datasets?staronly=true',
  },
  {
    name: 'My data',
    icon: 'fa-solid fa-circle-user',
    url: '/api/datasets?mydata=true',
  },
]

export const SortingColumns: Radio[] = [
  {
    value: 'name,asc',
    label: 'A to Z',
  },
  {
    value: 'name,desc',
    label: 'Z to A',
  },
  {
    value: 'no_stars,desc',
    label: 'Most favourite',
  },
  {
    value: 'updatedat,desc',
    label: 'Most recent',
  },
  {
    value: 'updatedat,asc',
    label: 'Less recent',
  },
]

export const DatasetSearchQueryParams = [
  'query',
  'offset',
  'limit',
  'storage_id',
  'bbox',
  'sortby',
  'operator',
  'staronly',
  'queryoperator',
  'mydata',
]

export const tagSearchKeys = [
  {
    key: 'extent',
    label: 'Extent',
  },
  {
    key: 'continent',
    label: 'Continent',
  },
  {
    key: 'region',
    label: 'Region',
  },
  {
    key: 'country',
    label: 'Country',
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
  {
    key: 'schema',
    label: 'Schema',
  },
  {
    key: 'provider',
    label: 'Data Provider',
  },
  {
    key: 'type',
    label: 'GIS Server',
  },
]

export const footerItems: { [key: string]: { title: string; url: string }[] } = {
  GeoHub: [
    {
      title: 'GeoHub',
      url: 'https://geohub.data.undp.org',
    },
    {
      title: 'Shared Maps',
      url: 'https://geohub.data.undp.org/maps',
    },
    {
      title: 'Dashboards',
      url: 'https://geohub.data.undp.org/dashboards',
    },
    {
      title: 'Electricity Dashboard',
      url: 'https://geohub.data.undp.org/dashboard/electricity',
    },
    {
      title: 'User Guide',
      url: 'https://docs.undpgeohub.org',
    },
  ],
  'For Developers': [
    {
      title: 'GeoHub Dev',
      url: 'https://dev.undpgeohub.org',
    },
    {
      title: 'GeoHub API documentation',
      url: '/api',
    },
    {
      title: 'Svelte UNDP design sytem',
      url: 'https://svelte-undp-design.undpgeohub.org',
    },
  ],
}

export const MapOrderByOptions = [
  {
    value: 'updatedat,desc',
    label: 'Most recent',
  },
  {
    value: 'updatedat,asc',
    label: 'less recent',
  },
  {
    value: 'name,asc',
    label: 'A to Z',
  },
  {
    value: 'name,desc',
    label: 'Z to A',
  },
]

export enum Permission {
  READ = 1,
  WRITE = 2,
  OWNER = 3,
}

export const AccepedExtensions: AcceptedExtension[] = [
  {
    name: 'GeoTIFF',
    extensions: ['tif', 'tiff'],
    href: 'https://gdal.org/drivers/raster/gtiff.html#raster-gtiff',
  },
  {
    name: 'NetCDF',
    extensions: ['nc'],
    href: 'https://gdal.org/drivers/raster/netcdf.html#raster-netcdf',
  },
  {
    name: 'Arc/Info ASCII Grid File',
    extensions: ['aig', 'asc', 'sgr', 'grd'],
    href: 'https://gdal.org/drivers/raster/aaigrid.html',
  },
  { name: 'Erdas Imagine', extensions: ['raw', 'bl'], href: 'https://gdal.org/drivers/raster/eir.html' },
  { name: 'ESRI Shapefile (zipped)', extensions: ['zip'], href: 'https://gdal.org/drivers/vector/shapefile.html' },
  { name: 'GeoJSON', extensions: ['geojson'], href: 'https://gdal.org/drivers/vector/geojson.html' },
  { name: 'PMTILES', extensions: ['pmtiles'], href: 'https://protomaps.com/docs/pmtiles' },
  { name: 'MBTILES', extensions: ['mbtiles'], href: 'https://github.com/mapbox/mbtiles-spec' },
  {
    name: 'ESRI File Geodatabase (OpenFileGDB)',
    extensions: ['gdb'],
    href: 'https://gdal.org/drivers/vector/openfilegdb.html#esri-file-geodatabase-openfilegdb',
  },
  {
    name: 'ESRI File Geodatabase (FileGDB)',
    extensions: ['gdb'],
    href: 'https://gdal.org/drivers/vector/filegdb.html',
  },
  { name: 'ESRI Personal GeoDatabase', extensions: ['mdb'], href: 'https://gdal.org/drivers/vector/pgeo.html' },
  { name: 'GeoPackage', extensions: ['gpkg'], href: 'https://gdal.org/drivers/vector/gpkg.html' },
]
