import { attribution } from '$lib/config/AppConfig';
import type { Tag } from '$lib/types';

export const createAttributionFromTags = (tags: Tag[]) => {
	const providers = tags?.filter((t) => t.key === 'provider');

	const values: string[] = providers?.map((provider) => provider.value);
	if (values && values.length > 0) {
		return values.join(',');
	} else {
		return attribution;
	}
};
