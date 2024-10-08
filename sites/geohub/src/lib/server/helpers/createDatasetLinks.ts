import { getBase64EncodedUrl } from '$lib/helper';
import type { DatasetFeature, Tag, VectorTileMetadata } from '$lib/types';
import { generateAzureBlobSasToken } from './generateAzureBlobSasToken';

export const createDatasetLinks = async (
	feature: DatasetFeature,
	origin: string,
	titilerUrl: string
) => {
	const tags: Tag[] | undefined = feature.properties.tags;
	const type = tags?.find((tag) => tag.key === 'type');

	feature.properties.links = [
		{
			rel: 'self',
			type: 'application/json',
			href: `${origin}/api/datasets/${feature.properties.id}`
		},
		{
			rel: 'dataset',
			type: 'text/html',
			href: `${origin}/data/${feature.properties.id}`
		}
	];

	if (type && ['pgtileserv'].includes(type.value)) {
		const id = tags?.find((tag) => tag.key === 'id');
		const layertype = tags?.find((tag) => tag.key === 'layertype');
		feature.properties.links.push({
			rel: 'metadatajson',
			type: 'application/json',
			href: `${origin}/api/vector/${type.value}/metadata.json?table=${id.value}${
				type.value === 'pgtileserv' ? `&type=${layertype.value}` : ''
			}`
		});
		feature.properties.links.push({
			rel: 'tilejson',
			type: 'application/json',
			href: `${origin}/api/vector/${type.value}/tile.json?table=${id.value}${
				type.value === 'pgtileserv' ? `&type=${layertype.value}` : ''
			}`
		});
		feature.properties.links.push({
			rel: 'pbf',
			type: 'application/vnd.mapbox-vector-tile',
			href: feature.properties.url
		});

		feature.properties.links.push({
			rel: 'preview',
			type: 'image/webp',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/auto/{width}x{height}.webp`
		});
		feature.properties.links.push({
			rel: 'stylejson',
			type: 'application/json',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/style.json`
		});
	} else if (type?.value === 'stac') {
		const stacType = tags?.find((tag) => tag.key === 'stacType')?.value;
		const product = tags?.find((t) => t.key === 'product')?.value;

		if (stacType === 'cog') {
			// remove dataset link from stac items
			feature.properties.links = feature.properties.links.filter((l) => l.rel !== 'dataset');

			const algorithmId = tags?.find((tag) => tag.key === 'algorithm')?.value;

			const b64EncodedUrl = getBase64EncodedUrl(feature.properties.url);
			if (product) {
				const expression = tags.find((t) => t.key === 'product_expression').value;
				const assets = tags.find((t) => t.key === 'product_assets').value;
				const assetParams = assets.join('&assets=');
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}&assets=${assetParams}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}&expression=${encodeURIComponent(
						expression
					)}&asset_as_band=true&unscale=false&resampling=nearest&reproject=nearest&max_size=1024&categorical=false&histogram_bins=8`
				});
				feature.properties.links.push({
					rel: 'tiles',
					type: 'image/png',
					href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
						b64EncodedUrl
					)}&expression=${encodeURIComponent(
						expression
					)}&asset_as_band=true&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
				feature.properties.links.push({
					rel: 'stac',
					type: 'application/json',
					href: `${titilerUrl}`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
						b64EncodedUrl
					)}&expression=${encodeURIComponent(
						expression
					)}&scale=1&bidx=1&resampling=nearest&return_mask=true`
				});
			} else {
				feature.properties.links.push({
					rel: 'download',
					type: 'image/tiff',
					href: feature.properties.url
				});

				feature.properties.links.push({
					rel: 'cog',
					type: 'application/json',
					href: `${titilerUrl}`
				});
				feature.properties.links.push({
					rel: 'info',
					type: 'application/json',
					href: `${titilerUrl}/info?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'statistics',
					type: 'application/json',
					href: `${titilerUrl}/statistics?url=${b64EncodedUrl}`
				});
				feature.properties.links.push({
					rel: 'tiles',
					type: 'image/png',
					href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
						b64EncodedUrl
					)}&scale=1&resampling=nearest&return_mask=true${algorithmId ? '' : '&bidx=1'}`
				});
				feature.properties.links.push({
					rel: 'tilejson',
					type: 'application/json',
					href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
						b64EncodedUrl
					)}&scale=1&resampling=nearest&return_mask=true${algorithmId ? '' : '&bidx=1'}`
				});
			}
		} else if (stacType === 'mosaicjson') {
			// remove dataset link from stac items
			feature.properties.links = feature.properties.links.filter((l) => l.rel !== 'dataset');

			const itemUrls = feature.properties.tags.filter((t) => t.key === 'itemUrl');
			const b64EncodedUrl = getBase64EncodedUrl(itemUrls[0].value);
			feature.properties.links.push({
				rel: 'mosaicjson',
				type: 'application/json',
				href: `${titilerUrl.replace('cog', 'mosaicjson')}`
			});
			feature.properties.links.push({
				rel: 'info',
				type: 'application/json',
				href: `${titilerUrl}/info?url=${b64EncodedUrl}`
			});
			feature.properties.links.push({
				rel: 'statistics',
				type: 'application/json',
				href: `${titilerUrl}/statistics?url=${b64EncodedUrl}`
			});
			feature.properties.links.push({
				rel: 'tilejson',
				type: 'application/json',
				href: `${titilerUrl.replace('cog', 'mosaicjson')}/tilejson.json?url=${encodeURIComponent(
					feature.properties.url
				)}`
			});
		} else if (stacType === 'collection') {
			feature.properties.links.push({
				rel: 'cog',
				type: 'application/json',
				href: `${titilerUrl}`
			});
		}
		feature.properties.links.push({
			rel: 'vrt',
			type: 'application/json',
			href: `${titilerUrl.replace('cog', 'vrt')}`
		});
		feature.properties.links.push({
			rel: 'algorithms',
			type: 'application/json',
			href: `${titilerUrl.replace('cog', 'algorithms')}`
		});
	} else {
		if (feature.properties.url.split('?').length === 1) {
			const sasToken = await generateAzureBlobSasToken(feature.properties.url);
			feature.properties.url = `${feature.properties.url}${sasToken}`;
		}
		const is_raster = feature.properties.is_raster;
		feature.properties.links.push({
			rel: 'download',
			type: is_raster ? 'image/tiff' : 'application/octet-stream',
			href: `${feature.properties.url.replace('pmtiles://', '')}`
		});

		feature.properties.links.push({
			rel: 'preview',
			type: 'image/webp',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/auto/{width}x{height}.webp`
		});
		feature.properties.links.push({
			rel: 'stylejson',
			type: 'application/json',
			href: `${origin}/api/datasets/${feature.properties.id}/preview/style.json`
		});

		if (is_raster) {
			const algorithmTags = tags?.filter((tag) => tag.key === 'algorithm');
			const algorithmId =
				algorithmTags && algorithmTags.length === 1 ? algorithmTags[0].value : undefined;

			const b64EncodedUrl = getBase64EncodedUrl(feature.properties.url);
			feature.properties.links.push({
				rel: 'cog',
				type: 'application/json',
				href: `${titilerUrl}`
			});
			feature.properties.links.push({
				rel: 'info',
				type: 'application/json',
				href: `${titilerUrl}/info?url=${b64EncodedUrl}`
			});
			feature.properties.links.push({
				rel: 'statistics',
				type: 'application/json',
				href: `${titilerUrl}/statistics?url=${b64EncodedUrl}${algorithmId ? `&algorithm=${algorithmId}` : '&bidx=1'}`
			});
			feature.properties.links.push({
				rel: 'tiles',
				type: 'image/png',
				href: `${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(
					b64EncodedUrl
				)}&scale=1&resampling=nearest&return_mask=true${algorithmId ? `&algorithm=${algorithmId}` : '&bidx=1'}`
			});
			feature.properties.links.push({
				rel: 'tilejson',
				type: 'application/json',
				href: `${titilerUrl}/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(
					b64EncodedUrl
				)}&scale=1&resampling=nearest&return_mask=true${algorithmId ? `&algorithm=${algorithmId}` : '&bidx=1'}`
			});
			feature.properties.links.push({
				rel: 'algorithms',
				type: 'application/json',
				href: `${titilerUrl.replace('cog', 'algorithms')}`
			});
		} else {
			let pbfUrl = feature.properties.url;
			if (!feature.properties.url.startsWith('pmtiles://')) {
				pbfUrl = pbfUrl.replace('/{z}/{x}/{y}', '/0/0/0');
			}
			const metadataUrl = `${origin}/api/vector/azstorage/metadata.json?pbfpath=${encodeURIComponent(pbfUrl)}`;
			feature.properties.links.push({
				rel: 'metadatajson',
				type: 'application/json',
				href: metadataUrl
			});

			if (pbfUrl.startsWith('pmtiles://')) {
				const resMetadata = await fetch(metadataUrl);
				if (resMetadata.ok) {
					const metadata: VectorTileMetadata = await resMetadata.json();
					if (metadata.json) {
						const availableLayers = metadata.json.vector_layers.map((l) => l.id);
						const pmtilesUrl = new URL(pbfUrl.replace('pmtiles://', ''));
						if (availableLayers.length === 1) {
							const fgbUrl = new URL(`${pmtilesUrl.pathname}.fgb${pmtilesUrl.search}`, pmtilesUrl);
							const resFgb = await fetch(fgbUrl);
							if (resFgb.ok) {
								feature.properties.links.push({
									rel: 'flatgeobuf',
									type: 'application/json',
									href: fgbUrl.href
								});
							}
						} else {
							for (const layer of availableLayers) {
								const fgbUrl = new URL(
									`${pmtilesUrl.pathname}.${layer}.fgb${pmtilesUrl.search}`,
									pmtilesUrl
								);
								const resFgb = await fetch(fgbUrl);
								if (resFgb.ok) {
									feature.properties.links.push({
										rel: `flatgeobuf-${layer}`,
										type: 'application/json',
										href: fgbUrl.href
									});
								}
							}
						}
					}
				}
			}
		}
	}

	return feature.properties;
};
