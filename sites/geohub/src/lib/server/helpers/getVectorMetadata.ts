import { generateAzureBlobSasToken } from '$lib/server/helpers';
import { clean } from '@undp-data/svelte-undp-components';
import * as pmtiles from 'pmtiles';

export const getVectorMetadata = async (url: string) => {
	const isPmtiles = url.indexOf('.pmtiles') !== -1;
	const urlObj = new URL(url).pathname.replace('/metadata.json', '').split('/');
	const sasToken = await generateAzureBlobSasToken(url);
	if (isPmtiles) {
		const p = new pmtiles.PMTiles(`${url}${sasToken}`);
		const metadata = await p.getMetadata();
		const header = await p.getHeader();
		const bounds: [number, number, number, number] = [
			header.minLon,
			header.minLat,
			header.maxLon,
			header.maxLat
		];
		const name: string = metadata.name ?? clean(urlObj.pop());
		const description: string | undefined = metadata.description;
		const source: string | undefined = metadata.attribution;
		return {
			name: name,
			bounds: bounds,
			description,
			source
		};
	} else {
		const apiUrl = `${url}${sasToken}`;
		const res = await fetch(apiUrl);
		const metadata = await res.json();
		const name: string = metadata.name ?? clean(urlObj.pop());
		const bounds: string = metadata.bounds;
		const description: string | undefined = metadata.description;
		const source: string | undefined = metadata.attribution;
		return {
			name,
			bounds: (bounds ? bounds.split(',').map((b) => Number(b)) : [-180, -90, 180, 90]) as [
				number,
				number,
				number,
				number
			],
			description,
			source
		};
	}
};
