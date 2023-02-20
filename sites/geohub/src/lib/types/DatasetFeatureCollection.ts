import type { DatasetFeature } from './DatasetFeature'
import type { Pages } from './Pages'
import type { StacLink } from './StacLink'

export interface DatasetFeatureCollection {
  type: 'FeatureCollection'
  features: DatasetFeature[]
  links: StacLink[]
  pages: Pages
}
