import { generateAzureBlobSasToken } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import { getBase64EncodedUrl } from '$lib/helper';
import {
	clean,
	type BandMetadata,
	type RasterTileMetadata
} from '@undp-data/svelte-undp-components';

export const getRasterMetadata = async (url: string) => {
	const sasToken = await generateAzureBlobSasToken(url);
	const fileUrl = `${url}${sasToken}`;
	const apiUrl = `${env.TITILER_ENDPOINT}/info?url=${getBase64EncodedUrl(fileUrl)}`;
	const res = await fetch(apiUrl);
	const json: RasterTileMetadata = await res.json();
	const band_metadata = json.band_metadata;
	const urlObj = new URL(url).pathname.split('/');
	const name: string = clean(urlObj.pop() as string);
	let description: string | undefined;
	let source: string | undefined;
	band_metadata?.forEach((band) => {
		band.forEach((data: string | BandMetadata) => {
			if (data instanceof String) return;
			const metadata = data as BandMetadata;
			description = metadata.Description;
			source = metadata.Source;
		});
	});

	let bounds = await getRasterBounds(fileUrl);
	bounds = bounds
		? bounds
		: ((json.bounds ? json.bounds : [-180, -90, 180, 90]) as [number, number, number, number]);

	return {
		name,
		bounds: bounds,
		description: description,
		source: source
	};
};

const getRasterBounds = async (cogUrl: string) => {
	const apiUrl = `${env.TITILER_ENDPOINT}/bounds?url=${getBase64EncodedUrl(cogUrl)}&crs=EPSG:4326`;
	const res = await fetch(apiUrl);
	if (!res.ok) {
		return;
	}
	const json = await res.json();
	return json.bounds;
};
