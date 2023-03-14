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
}
