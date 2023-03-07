import { DatasetSearchLimit } from './DatasetSearchLimit'
import { LineWidth } from './LineWidth'
import { SearchLimit } from './SearchLimit'

export interface UserConfig {
  SearchLimit: number
  DatasetSearchLimit: number
  LineWidth: number
}

export const DefaultUserConfig = {
  SearchLimit: SearchLimit,
  DatasetSearchLimit: DatasetSearchLimit,
  LineWidth: LineWidth,
}
