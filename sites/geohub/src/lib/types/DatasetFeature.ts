import type { AccessLevel, Permission } from '$lib/config/AppConfig';
import type { StacLink } from './StacLink';
import type { Tag } from './Tag';

export interface DatasetFeature {
	type: 'Feature';
	geometry?: {
		type: string;
		coordinates: [number, number] | [number, number][] | [number, number][][];
	};
	properties: {
		id?: string;
		url: string;
		name?: string;
		description?: string;
		is_raster: boolean;
		license?: string;
		access_level: AccessLevel;
		createdat?: string;
		created_user?: string;
		updatedat?: string;
		updated_user?: string;
		tags?: Tag[];
		no_stars?: number;
		is_star?: boolean;
		permission?: Permission;
		links?: StacLink[];
	};
}
