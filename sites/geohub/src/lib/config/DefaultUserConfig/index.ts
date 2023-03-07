import { DatasetSearchLimit } from './DatasetSearchLimit'
import { SearchLimit } from './SearchLimit'

export interface UserConfig {
  SearchLimit: number
  DatasetSearchLimit: number
}

export const DefaultUserConfig = {
  SearchLimit: SearchLimit,
  DatasetSearchLimit: DatasetSearchLimit,
}
