import { DatasetSearchLimit } from './DatasetSearchLimit'
import { LineWidth } from './LineWidth'
import { NumberOfClasses } from './NumberOfClasses'
import { SearchLimit } from './SearchLimit'

export interface UserConfig {
  SearchLimit: number
  DatasetSearchLimit: number
  LineWidth: number
  NumberOfClasses: number
}

export const DefaultUserConfig = {
  SearchLimit: SearchLimit,
  DatasetSearchLimit: DatasetSearchLimit,
  LineWidth: LineWidth,
  NumberOfClasses: NumberOfClasses,
}
