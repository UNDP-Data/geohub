import type { StyleSpecification } from 'maplibre-gl';
import type { Layer } from './Layer';
import type { Link } from './Link';

export interface DashboardMapStyle {
	id: string;
	name: string;
	createdat: string;
	updatedat: string;
	style?: StyleSpecification;
	layers?: Layer[];
	access_level: number;
	created_user: string;
	updated_user: string;
	no_stars: number;
	is_star: boolean;
	links: Link[];
}
