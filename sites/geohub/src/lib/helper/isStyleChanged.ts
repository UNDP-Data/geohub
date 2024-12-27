import { isEqual } from 'lodash-es';
import type { StyleSpecification } from 'maplibre-gl';

const deleteAdminSources = (style: StyleSpecification) => {
	const copied: StyleSpecification = JSON.parse(JSON.stringify(style));
	const IGNORE_SOURCE_IDS = ['cgaz', 'full-geom'];
	copied.layers = [
		...copied.layers.filter((l) => !('source' in l && IGNORE_SOURCE_IDS.includes(l.source)))
	];
	IGNORE_SOURCE_IDS.forEach((src) => {
		if (copied.sources[src]) {
			delete copied.sources[src];
		}
	});

	// delete sky
	if ('sky' in copied) {
		delete copied.sky;
	}

	Object.keys(copied.sources).forEach((src) => {
		const source = copied.sources[src];
		if ('tiles' in source && source.tiles) {
			for (let i = 0; i < source.tiles.length; i++) {
				source.tiles[i] = removeSasTokenFromUrl(source.tiles[i]);
			}
		} else if ('url' in source && source.url) {
			source.url = removeSasTokenFromUrl(source.url);
		} else {
			return;
		}
	});
	return copied;
};

const removeSasTokenFromUrl = (url: string) => {
	const isPmtiles = url.startsWith('pmtiles://');
	const newUrlString = url.replace('pmtiles://', '');
	let newUrl = new URL(newUrlString);
	if (newUrl.search.startsWith('?sv=')) {
		newUrl = new URL(`${newUrl.origin}${newUrl.pathname}`);
	} else if (newUrl.searchParams.get('url')) {
		const blobUrl = newUrl.searchParams.get('url') as string;
		const blobUrlWithoutToken = blobUrl.split('?')[0];
		newUrl.searchParams.set('url', blobUrlWithoutToken);
	}

	return `${isPmtiles ? 'pmtiles://' : ''}${newUrl.href}`;
};

export const isStyleChanged = (style1: StyleSpecification, style2: StyleSpecification) => {
	if (!style1 || !style2) return false;
	const newStyle1 = deleteAdminSources(style1);
	const newStyle2 = deleteAdminSources(style2);
	const noChanged =
		newStyle1.layers.length === newStyle2.layers.length &&
		isEqual(newStyle1.layers, newStyle2.layers) &&
		isEqual(newStyle1.sources, newStyle2.sources);
	return !noChanged;
};
