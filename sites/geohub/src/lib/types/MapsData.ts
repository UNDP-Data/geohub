import type { DashboardMapStyle } from './DashboardMapStyle';
import type { StacLink } from './StacLink';
import type { Pages } from './Pages';

export interface MapsData {
	styles: DashboardMapStyle[];
	links: StacLink[];
	pages: Pages;
}
