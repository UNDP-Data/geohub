import { DataCategories, TagSearchKeys } from '$lib/config/AppConfig';
import type { Tag } from '$lib/types';
import type { Breadcrumb } from '@undp-data/svelte-undp-design';
import { getBulmaTagColor } from './getBulmaTagColor';

export const getSelectedTagsFromUrl = (url: URL) => {
	const selectedTags: Tag[] = [];
	TagSearchKeys.forEach((key) => {
		const values = url.searchParams.getAll(key.key);
		values.forEach((v) => {
			if (selectedTags.find((t) => t.key === key.key && t.value === v)) return;
			if (
				DataCategories.find(
					(c: Breadcrumb) => `${key.key}=${v}`.indexOf(c.url.replace('/api/datasets?', '')) !== -1
				)
			) {
				// skip if tags are in category's URL
				return;
			}
			selectedTags.push({
				key: key.key,
				value: v,
				color: getBulmaTagColor()
			});
		});
	});
	return selectedTags;
};
