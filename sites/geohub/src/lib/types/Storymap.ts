import type { AccessLevel, Permission } from '$lib/config/AppConfig';
import {
	type StoryMapConfig as BaseStoryMapConfig,
	type StoryMapChapter as BaseStoryMapChapter,
	type StoryMapTemplate
} from '@undp-data/svelte-maplibre-storymap';
import type { Link } from './Link';

export interface StoryMapChapter extends BaseStoryMapChapter {
	style_id?: number;
	base_style_id?: string;
	hillshade?: boolean;
	terrain?: boolean;
	createdat?: string;
	created_user?: string;
	updatedat?: string;
	updated_user?: string;
}

export interface StoryMapConfig extends BaseStoryMapConfig {
	id?: string;
	style_id?: number;
	base_style_id?: string;
	template_id?: StoryMapTemplate;
	hillshade?: boolean;
	terrain?: boolean;
	access_level?: AccessLevel;
	createdat?: string;
	created_user?: string;
	updatedat?: string;
	updated_user?: string;
	no_stars?: number;
	is_star?: boolean;
	permission?: Permission;
	links?: Link[];
}
