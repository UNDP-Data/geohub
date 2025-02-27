import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { generateAzureBlobSasToken, getDatasetById, isSuperuser } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { DatasetFeature, Tag } from '$lib/types';
import { removeSasTokenFromDatasetUrl } from '$lib/helper';
import DatasetManager from '$lib/server/DatasetManager';

export const Output = z.custom<DatasetFeature>().describe('dataset feature');

export const Input = z
	.custom<DatasetFeature>()
	.describe('dataset feature to register')
	.openapi({
		example: {
			type: 'string',
			geometry: {
				type: 'string',
				coordinates: [0]
			},
			properties: {
				id: 'string',
				url: 'string',
				name: 'string',
				description: 'string',
				is_raster: true,
				license: 'string',
				access_level: 0,
				createdat: 'string',
				created_user: 'string',
				updatedat: 'string',
				updated_user: 'string',
				tags: [
					{
						key: 'string',
						value: 'string',
						count: 0
					}
				],
				no_stars: 0,
				permission: 0,
				is_star: true,
				links: [
					{
						rel: 'string',
						type: 'string',
						href: 'string'
					}
				]
			}
		} as unknown as DatasetFeature
	});

const description = `
Register a dataset feature to GeoHub. If the dataset is already registered, the endpoint is going to update the dataset.

Steps to register a dataset through this endpoint

1.Authenticate to GeoHub

The endpoint requires to be authenticated. You can sign in to GeoHub through your browser if you use swagger. Otherwise, please use \`/api/token\` endpoint to generate an access token.

2.Create body for registration.

It is basically the same feature of \`/api/datasets\` endpoint required to pass to POST api. You need to fill all information properly to register a dataset. 

The below JSON is the basic structure of Feature Object. \`type\` must be \`Feature\`, and you need to add coordinates at \`geometry\` property. Normally, BBOX is used for it.

\`\`\`
{
	"type": "Feature",
	"geometry": {
	"type": "Polygon",
	"coordinates": [
	]
	},
	"properties": {
	}
}
\`\`\`

In terms of \`properties\`, the below table shows which property is essential to register.

| Property | Required | Description |
|---|---|---|
| \`id\` | Y | MD5 Hash key generated from url |
| \`url\` | Y | URL of a blob. SAS Token for blob storage access is not needed. If PMTiles, \`pmtiles://\` protocol is required. |
| \`name\` | Y | title of a dataset. |
| \`description\` | Y | description of a dataset. Write it as details as possible. |
| \`is_raster\` | Y | true: raster dataset, false: vector dataset |
| \`license\` | Y | Open data license name |
| \`access_level\` | Y | 1: Private, 2: Organization, 3: Public |
| \`createdat\` | N | Not required for registration, but required for updating |
| \`created_user\` | N | Not required for registration, but required for updating |
| \`updatedat\` | N | Not required for registration |
| \`updated_user\` | N | Not required for registration |
| \`tags\` | Y | See next section for further details |
| \`no_stars\` | N | Not required for registration |
| \`permission\` | N | Not required for registration |
| \`is_star\` | N | Not required for registration |
| \`links\` | N | Not required for registration |


3.Tag registrations

Particularly, tags are important to identify a dataset. The below table gives you an overview of tags used in GeoHub.

| key | required | description |
|---|---|---|
| \`type\` | Y | \`azure\` value is for COG/PMTiles dataset. \`pgtileserv\` value is needed for pg_tileserv layer. \`stac\` is required for STAC collection or catalog. |
| \`schema\` | N | Only needed for \`type=pgtileserv\`. Schema name for a dataset|
| \`table\` | N | Only needed for \`type=pgtileserv\`. Table name for a dataset |
| \`layertype\` | N | Only needed for \`type=pgtileserv\`. either \`table\` or \`function\` |
| \`id\` | N | Only needed for \`type=pgtileserv\`. id of pg_tileserv layer |
| \`provider\` | Y | at least a provider name is required. You can add many provider tag as you wish. |
| \`extent\` | N | If it is global data, \`Global\` value can be added |
| \`continent\` | N | If it is not global data, continent tag like \`Africa\` is recommended to be added. See \`/api/continents\` api for available values. |
| \`region\` | N | If it is not global data, region tag like \`Sub-Saharan Africa\` is recommended to be added. See \`/api/regions\` api for available values. |
| \`country\` | N | If it is not global data, country tag like \`KEN\` is recommended to be added. See \`/api/countries\` api for available values. You can add many country tag as you wish. |
| \`sdg_goal\` | N | If a dataset is related to any SDGs, the number like \`1\` for poverty can be added. You can add many sdg_goal tag as you wish. |
| \`unit\` | N | If raster dataset, unit tag is recommended to be added. |
| \`year\` | N | If applicable, \`year\` tag can be added. |
| \`resolution\` | N | If applicable, \`resolution\` tag can be added. |


For STAC collection's registration, it is recommended to use STAC management tool in GeoHub. Tags required for STAC are not covered by the above table.

For pg_tileserv registration/deletion, it is also recommended to use pg_tileserv layer management tool in GeoHub.

The best way to know which tags are essential for a dataset is to search a dataset in GeoHub. The below is an example dataset URLs for each type of a dataset.

- [Raster dataset (COG)](/api/datasets/241c5b17f396f114ad6f9063d07762b8)
- [Vector dataset (PMTiles)](/api/datasets/196af310ffb45117cb4f091fa5d98705)
- [Vector dataset (pg_tileserv)](/api/datasets/320cf4ffcf6414a68b428f14a5728053)
- [STAC Collection (Catalog)](/api/datasets/351155bfc6f45c2ae47e7cbb4f439a47)
- [STAC Catalog (Catalog)](/api/datasets/e696b278429ed1ee0579e6257df1ca59)
- [STAC Collection (API)](/api/datasets/c47e79d248510ba2d397b76972eb8a83)

4.Register a dataset with access token

Once you have made all properties required for your dataset, you can use the following template command to register your dataset into the database.

\`\`\`
curl -X 'POST' \
	'https://geohub.data.undp.org/api/datasets?token={your generated token}' \
	-H 'accept: application/json' \
	-H 'Content-Type: application/json' \
	-d '{
	"type": "string",
	"geometry": {
	"type": "string",
	"coordinates": [
	]
	},
	"properties": {
	"id": "string",
	"url": "string",
	"name": "string",
	"description": "string",
	"is_raster": true,
	"license": "string",
	"access_level": 0,
	"tags": [
		{
		"key": "type",
		"value": "azure"
		}
	]
	}
}'
\`\`\`
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register a dataset feature to GeoHub';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	403: appError(403, 'Permission error'),
	400: appError(400, 'Parameter error')
};

export default new Endpoint({ Input, Output, Modifier, Error }).handle(
	async (param, { fetch, locals, request }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user_email = session?.user.email;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const body: DatasetFeature = await request.json();
		if (!body.properties.id) {
			error(400, { message: 'id property is required' });
		}
		if (!body.properties.name) {
			error(400, { message: 'name property is required' });
		}
		if (!body.properties.url) {
			error(400, { message: 'url property is required' });
		}
		if (!body.properties.license) {
			error(400, { message: 'license property is required' });
		}
		if (!body.properties.description) {
			error(400, { message: 'description property is required' });
		}

		const tags: Tag[] = body.properties.tags as Tag[];

		if (tags.filter((t) => t.key === 'provider').length === 0) {
			error(400, 'Data provider is required');
		}

		const now = new Date().toISOString();
		if (!body.properties.created_user) {
			body.properties.created_user = user_email;
			body.properties.createdat = now;
		}
		body.properties.updated_user = user_email;
		body.properties.updatedat = now;

		// delete SAS token from URL
		body.properties.url = removeSasTokenFromDatasetUrl(body.properties.url);
		body.properties.url = decodeURI(body.properties.url);

		const dsManager = new DatasetManager(body);
		await dsManager.upsert();

		// if the dataset is under data-upload storage account, delete .ingesting file after registering metadata
		const dataType = body.properties.tags?.find((t) => t.key === 'type')?.value ?? '';
		const azaccount = env.AZURE_STORAGE_ACCOUNT_UPLOAD;
		if (dataType === 'azure' && body.properties.url.indexOf(azaccount) > -1) {
			const ingestingFileUrl = `${body.properties.url.replace('pmtiles://', '')}.ingesting`;
			const sasToken = await generateAzureBlobSasToken(ingestingFileUrl, 60000, 'rwd');
			const ingestingUrlWithSasUrl = `${ingestingFileUrl}${sasToken}`;
			const res = await fetch(ingestingUrlWithSasUrl);
			if (res.ok) {
				// if exists, delete file
				const resDelete = await fetch(ingestingUrlWithSasUrl, {
					method: 'DELETE'
				});
				if (resDelete.ok) {
					console.debug(`Deleted ${ingestingUrlWithSasUrl}`);
				}
			}
		}
		const dataset = await getDatasetById(body.properties.id, is_superuser, user_email);

		return dataset as DatasetFeature;
	}
);
