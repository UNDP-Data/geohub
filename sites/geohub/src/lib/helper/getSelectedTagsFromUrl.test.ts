import { describe, it, expect } from 'vitest';
import { getSelectedTagsFromUrl } from '$lib/helper';

describe('getSelectedTagsFromUrl', () => {
	it('should return tags from the provided URL', () => {
		const tags = getSelectedTagsFromUrl(
			new URL(
				'https://dev.undpgeohub.org/?operator=and&limit=25&breadcrumbs=Home&granularity=Hyperlocal&year=2000&sdg_target=elevation&sdg_target=iucn&queryoperator=and&sortby=no_stars%2Cdesc'
			)
		);
		expect(tags.map((t) => t.key)).toEqual(['granularity', 'year', 'sdg_target', 'sdg_target']);
	});
});
