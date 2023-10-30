import type { DashboardMapStyle } from './DashboardMapStyle';
import type { Link } from './Link';
import type { Pages } from './Pages';

export interface MapsData {
	styles: DashboardMapStyle[];
	links: Link[];
	pages: Pages;
}
