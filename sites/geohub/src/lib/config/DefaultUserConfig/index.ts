import { DataPageSortingColumn } from './DataPageSortingColumn'
import { DatasetSearchLimit } from './DatasetSearchLimit'
import { DatasetSearchQueryOperator } from './DatasetSearchQueryOperator'
import { DatasetSortingColumn } from './DatasetSortingColumn'
import { LineWidth } from './LineWidth'
import { MapPageSortingColumn } from './MapPageSortingColumn'
import { NumberOfClasses } from './NumberOfClasses'
import { SearchLimit } from './SearchLimit'
import { TagSearchOperator } from './TagSearchOperator'
import { SidebarPosition } from './SidebarPosition'
import type { ClassificationMethodTypes } from '$lib/config/AppConfig'
import { ClassificationMethod } from '$lib/config/DefaultUserConfig/ClassificationMethod'
import { LabelFontSize } from '$lib/config/DefaultUserConfig/LabelFontSize'
import { LabelHaloWidth } from '$lib/config/DefaultUserConfig/LabelHaloWidth'
import { IconOverlapPriority } from '$lib/config/DefaultUserConfig/IconOverlapPriority'
import { RasterResamplingMethod } from '$lib/config/DefaultUserConfig/RasterResamplingMethod'
import { IconSize } from '$lib/config/DefaultUserConfig/IconSize'
import { IconImage } from '$lib/config/DefaultUserConfig/IconImage'
import { LayerOpacity } from '$lib/config/DefaultUserConfig/LayerOpacity'
import { LinePattern } from '$lib/config/DefaultUserConfig/LinePattern'

export interface UserConfig {
  SearchLimit: number
  DatasetSearchLimit: number
  DatasetSearchQueryOperator: 'and' | 'or'
  DatasetSortingColumn: string
  DataPageSortingColumn: string
  TagSearchOperator: 'and' | 'or'
  MapPageSortingColumn: string
  LineWidth: number
  NumberOfClasses: number
  SidebarPosition: 'left' | 'right'
  ClassificationMethod: ClassificationMethodTypes
  RasterResamplingMethod: 'nearest' | 'linear'
  LayerOpacity: number
  IconImage: string
  IconSize: number
  IconOverlapPriority: 'always' | 'never' | 'cooperative'
  LinePattern: 'solid' | 'dash' | 'dot' | 'dashdot'
  LabelFontSize: number
  LabelHaloWidth: number
}

export const DefaultUserConfig = {
  SidebarPosition,
  SearchLimit,
  DatasetSearchLimit,
  DatasetSearchQueryOperator,
  DatasetSortingColumn,
  DataPageSortingColumn,
  TagSearchOperator,
  MapPageSortingColumn,
  LineWidth,
  NumberOfClasses,
  ClassificationMethod,
  RasterResamplingMethod,
  LabelFontSize,
  LabelHaloWidth,
  IconOverlapPriority,
  IconSize,
  IconImage,
  LayerOpacity,
  LinePattern,
}
