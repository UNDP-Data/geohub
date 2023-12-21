import type { BandMetadata, RasterTileMetadata } from '$lib/types';
import { generateAzureBlobSasToken } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import { clean, getBase64EncodedUrl } from '$lib/helper';

export const getRasterMetadata = async (url: string) => {
	const sasToken = generateAzureBlobSasToken(url);
	const fileUrl = `${url}${sasToken}`;
	const apiUrl = `${env.DEV_TITILER_ENDPOINT}/info?url=${getBase64EncodedUrl(fileUrl)}`;
	const res = await fetch(apiUrl);
	const json: RasterTileMetadata = await res.json();
	const band_metadata = json.band_metadata;
	const urlObj = new URL(url).pathname.split('/');
	const name: string = clean(urlObj.pop());
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

	return {
		name,
		bounds: (json.bounds ? json.bounds : [-180, -90, 180, 90]) as [number, number, number, number],
		description: description,
		source: source
	};
};
