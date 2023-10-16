import type { StacAsset } from './StacAsset';
import type { Link } from './Link';

export interface StacCollection {
	type: 'Collection';
	stac_version: string;
	id: string;
	title?: string;
	description: string;
	keywords?: string[];
	license: string;
	providers?: {
		name: string;
		description?: string;
		roles?: ['licensor' | 'producer' | 'processor' | 'host'];
		url?: string;
	}[];
	extent: {
		spatial: {
			bbox: [[number, number, number, number]];
		};
		temporal: {
			interval: [[string, string | null]];
		};
	};
	summaries: {
		[key: string]:
			| { minimum: string | number; maximum: string | number }
			| {
					name: string;
					description: string;
					gsd?: number;
					common_name?: string;
					center_wavelength?: number;
					full_width_half_max?: number;
			  }
			| JSON;
	};
	links: Link[];
	assets?: { [key: string]: StacAsset };
	item_assets?: {
		[key: string]: {
			title: string;
			type: string;
			roles: string[];
			gsd: number;
		};
	};
	'sci:doi'?: string;
	stac_extensions?: string[];
	'msft:container'?: string;
	'msft:storage_account'?: string;
	'msft:short_description'?: string;
}
