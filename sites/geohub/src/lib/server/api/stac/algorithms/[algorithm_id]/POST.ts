import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { env } from '$env/dynamic/private';
import { createDatasetLinks } from '$lib/server/helpers';
import type { DatasetFeature } from '$lib/types';

export const Output = z.custom<DatasetFeature>().describe('The object of STAC API or Catalogs');

export const Param = z.object({
	algorithm_id: z.string().describe('Algorithm ID')
});

export const Input = z
	.custom<DatasetFeature>()
	.describe('Dataset feature object to apply algorithm')
	.openapi({
		example: {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[-153.93672, -16.36795876],
						[-153.93672, -15.65074937],
						[-153.40912, -16.36795876],
						[-153.40912, -15.65074937],
						[-153.93672, -16.36795876]
					]
				]
			},
			properties: {
				id: 'c2f8c473ee5544110f3754db42bd272e',
				name: 'Sentinel-2 Level-2A - visual',
				description:
					'The [Sentinel-2](https://sentinel.esa.int/web/sentinel/missions/sentinel-2) program provides global imagery in thirteen spectral bands at 10m-60m resolution and a revisit time of approximately five days.  This dataset represents the global Sentinel-2 archive, from 2016 to the present, processed to L2A (bottom-of-atmosphere) using [Sen2Cor](https://step.esa.int/main/snap-supported-plugins/sen2cor/) and converted to [cloud-optimized GeoTIFF](https://www.cogeo.org/) format.',
				license: 'proprietary',
				url: 'https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/05/L/MC/2023/10/10/S2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE/GRANULE/L2A_T05LMC_A043354_20231010T203930/IMG_DATA/R10m/T05LMC_20231010T203931_TCI_10m.tif?st=2025-02-13T06%3A20%3A41Z&se=2025-02-14T07%3A05%3A41Z&sp=rl&sv=2024-05-04&sr=c&skoid=9c8ff44a-6a2c-4dfb-b298-1c9212f64d9a&sktid=72f988bf-86f1-41af-91ab-2d7cd011db47&skt=2025-02-14T04%3A03%3A14Z&ske=2025-02-21T04%3A03%3A14Z&sks=b&skv=2024-05-04&sig=KxxdI0VlYiuzzZhPfqBqXYMu8lHECbafIN9Hz6AnP7U%3D',
				is_raster: true,
				access_level: 3,
				tags: [
					{
						key: 'type',
						value: 'stac'
					},
					{
						key: 'stacApiType',
						value: 'api'
					},
					{
						key: 'stacType',
						value: 'cog'
					},
					{
						key: 'stac',
						value: 'microsoft-pc'
					},
					{
						key: 'collection',
						value: 'sentinel-2-l2a'
					},
					{
						key: 'item',
						value: 'S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454'
					},
					{
						key: 'provider',
						value: 'ESA'
					},
					{
						key: 'provider',
						value: 'Esri'
					},
					{
						key: 'provider',
						value: 'Microsoft'
					},
					{
						key: 'asset',
						value: 'visual'
					}
				],
				links: [
					{
						rel: 'self',
						type: 'application/json',
						href: 'http://localhost:5173/api/stac/microsoft-pc/sentinel-2-l2a/S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454/visual'
					},
					{
						rel: 'download',
						type: 'image/tiff',
						href: 'https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/05/L/MC/2023/10/10/S2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE/GRANULE/L2A_T05LMC_A043354_20231010T203930/IMG_DATA/R10m/T05LMC_20231010T203931_TCI_10m.tif?st=2025-02-13T06%3A20%3A41Z&se=2025-02-14T07%3A05%3A41Z&sp=rl&sv=2024-05-04&sr=c&skoid=9c8ff44a-6a2c-4dfb-b298-1c9212f64d9a&sktid=72f988bf-86f1-41af-91ab-2d7cd011db47&skt=2025-02-14T04%3A03%3A14Z&ske=2025-02-21T04%3A03%3A14Z&sks=b&skv=2024-05-04&sig=KxxdI0VlYiuzzZhPfqBqXYMu8lHECbafIN9Hz6AnP7U%3D'
					},
					{
						rel: 'cog',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/cog'
					},
					{
						rel: 'info',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/cog/info?url=https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/05/L/MC/2023/10/10/S2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE/GRANULE/L2A_T05LMC_A043354_20231010T203930/IMG_DATA/R10m/T05LMC_20231010T203931_TCI_10m.tif?c3Q9MjAyNS0wMi0xM1QwNiUzQTIwJTNBNDFaJnNlPTIwMjUtMDItMTRUMDclM0EwNSUzQTQxWiZzcD1ybCZzdj0yMDI0LTA1LTA0JnNyPWMmc2tvaWQ9OWM4ZmY0NGEtNmEyYy00ZGZiLWIyOTgtMWM5MjEyZjY0ZDlhJnNrdGlkPTcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyZza3Q9MjAyNS0wMi0xNFQwNCUzQTAzJTNBMTRaJnNrZT0yMDI1LTAyLTIxVDA0JTNBMDMlM0ExNFomc2tzPWImc2t2PTIwMjQtMDUtMDQmc2lnPUt4eGRJMFZsWWl1enpaaFBmcUJxWFlNdThsSEVDYmFmSU45SHo2QW5QN1UlM0Q='
					},
					{
						rel: 'statistics',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/cog/statistics?url=https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/05/L/MC/2023/10/10/S2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE/GRANULE/L2A_T05LMC_A043354_20231010T203930/IMG_DATA/R10m/T05LMC_20231010T203931_TCI_10m.tif?c3Q9MjAyNS0wMi0xM1QwNiUzQTIwJTNBNDFaJnNlPTIwMjUtMDItMTRUMDclM0EwNSUzQTQxWiZzcD1ybCZzdj0yMDI0LTA1LTA0JnNyPWMmc2tvaWQ9OWM4ZmY0NGEtNmEyYy00ZGZiLWIyOTgtMWM5MjEyZjY0ZDlhJnNrdGlkPTcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyZza3Q9MjAyNS0wMi0xNFQwNCUzQTAzJTNBMTRaJnNrZT0yMDI1LTAyLTIxVDA0JTNBMDMlM0ExNFomc2tzPWImc2t2PTIwMjQtMDUtMDQmc2lnPUt4eGRJMFZsWWl1enpaaFBmcUJxWFlNdThsSEVDYmFmSU45SHo2QW5QN1UlM0Q='
					},
					{
						rel: 'bounds',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/cog/bounds?url=https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/05/L/MC/2023/10/10/S2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE/GRANULE/L2A_T05LMC_A043354_20231010T203930/IMG_DATA/R10m/T05LMC_20231010T203931_TCI_10m.tif?c3Q9MjAyNS0wMi0xM1QwNiUzQTIwJTNBNDFaJnNlPTIwMjUtMDItMTRUMDclM0EwNSUzQTQxWiZzcD1ybCZzdj0yMDI0LTA1LTA0JnNyPWMmc2tvaWQ9OWM4ZmY0NGEtNmEyYy00ZGZiLWIyOTgtMWM5MjEyZjY0ZDlhJnNrdGlkPTcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyZza3Q9MjAyNS0wMi0xNFQwNCUzQTAzJTNBMTRaJnNrZT0yMDI1LTAyLTIxVDA0JTNBMDMlM0ExNFomc2tzPWImc2t2PTIwMjQtMDUtMDQmc2lnPUt4eGRJMFZsWWl1enpaaFBmcUJxWFlNdThsSEVDYmFmSU45SHo2QW5QN1UlM0Q=&crs=EPSG:4326'
					},
					{
						rel: 'tiles',
						type: 'image/png',
						href: 'https://titiler-dev.undpgeohub.org/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=https%3A%2F%2Fsentinel2l2a01.blob.core.windows.net%2Fsentinel2-l2%2F05%2FL%2FMC%2F2023%2F10%2F10%2FS2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE%2FGRANULE%2FL2A_T05LMC_A043354_20231010T203930%2FIMG_DATA%2FR10m%2FT05LMC_20231010T203931_TCI_10m.tif%3Fc3Q9MjAyNS0wMi0xM1QwNiUzQTIwJTNBNDFaJnNlPTIwMjUtMDItMTRUMDclM0EwNSUzQTQxWiZzcD1ybCZzdj0yMDI0LTA1LTA0JnNyPWMmc2tvaWQ9OWM4ZmY0NGEtNmEyYy00ZGZiLWIyOTgtMWM5MjEyZjY0ZDlhJnNrdGlkPTcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyZza3Q9MjAyNS0wMi0xNFQwNCUzQTAzJTNBMTRaJnNrZT0yMDI1LTAyLTIxVDA0JTNBMDMlM0ExNFomc2tzPWImc2t2PTIwMjQtMDUtMDQmc2lnPUt4eGRJMFZsWWl1enpaaFBmcUJxWFlNdThsSEVDYmFmSU45SHo2QW5QN1UlM0Q%3D&scale=1&resampling=nearest&return_mask=true&bidx=1'
					},
					{
						rel: 'tilejson',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/cog/WebMercatorQuad/tilejson.json?url=https%3A%2F%2Fsentinel2l2a01.blob.core.windows.net%2Fsentinel2-l2%2F05%2FL%2FMC%2F2023%2F10%2F10%2FS2A_MSIL2A_20231010T203931_N0509_R028_T05LMC_20231010T233454.SAFE%2FGRANULE%2FL2A_T05LMC_A043354_20231010T203930%2FIMG_DATA%2FR10m%2FT05LMC_20231010T203931_TCI_10m.tif%3Fc3Q9MjAyNS0wMi0xM1QwNiUzQTIwJTNBNDFaJnNlPTIwMjUtMDItMTRUMDclM0EwNSUzQTQxWiZzcD1ybCZzdj0yMDI0LTA1LTA0JnNyPWMmc2tvaWQ9OWM4ZmY0NGEtNmEyYy00ZGZiLWIyOTgtMWM5MjEyZjY0ZDlhJnNrdGlkPTcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyZza3Q9MjAyNS0wMi0xNFQwNCUzQTAzJTNBMTRaJnNrZT0yMDI1LTAyLTIxVDA0JTNBMDMlM0ExNFomc2tzPWImc2t2PTIwMjQtMDUtMDQmc2lnPUt4eGRJMFZsWWl1enpaaFBmcUJxWFlNdThsSEVDYmFmSU45SHo2QW5QN1UlM0Q%3D&scale=1&resampling=nearest&return_mask=true&bidx=1'
					},
					{
						rel: 'vrt',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/vrt'
					},
					{
						rel: 'algorithms',
						type: 'application/json',
						href: 'https://titiler-dev.undpgeohub.org/algorithms'
					}
				]
			}
		}
	});

export const Error = {
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Create a DatasetFeature object with an algorithm applied for stac dataset';
	c.description = 'Create a DatasetFeature object with an algorithm applied for stac dataset';
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Param, Input, Output, Error, Modifier }).handle(
	async (param, { url, request }) => {
		const feature = await request.json();
		const tool = param.algorithm_id;
		feature.properties.tags = feature.properties.tags.filter(
			(t: { key: string }) => t.key !== 'algorithm'
		);
		feature.properties.tags = [...feature.properties.tags, { key: 'algorithm', value: tool }];
		feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
		return feature;
	}
);
