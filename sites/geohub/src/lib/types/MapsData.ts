import { DashboardMapStyle } from './DashboardMapStyle'
import { StacLink } from './StacLink'
import { Pages } from './Pages'

export interface MapsData {
  styles: DashboardMapStyle[]
  links: StacLink[]
  pages: Pages
}
