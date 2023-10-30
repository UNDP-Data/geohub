import { Command } from 'commander';
import { PoolClient } from 'pg';
import { getBase64EncodedUrl } from '../helpers';
import {
	BandMetadata,
	DatasetFeature,
	DatasetFeatureCollection,
	RasterTileMetadata,
	Tag
} from '../interfaces';
import { DatabaseManager, Tags } from '../util';

const program = new Command();
program
	.name('cog-unit')
	.description('Retrieve unit from COG metadata and insert it to tag table')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.option(
		'-t, --titiler-url [titiler-url]',
		'Base url for titiler',
		'https://titiler.undpgeohub.org'
	)
	.action(async () => {
		console.time('cog-unit');
		const options = program.opts();
		const database: string = options.database;
		const titilerUrl: string = options.titilerUrl;

		const rasterDatasets = await getRasterDatasets();

		const dataset_tag: { [key: string]: Tag } = {};
		for (const dataset of rasterDatasets) {
			console.debug(
				`${rasterDatasets.indexOf(dataset) + 1} / ${rasterDatasets.length}: ${
					dataset.properties.id
				}`
			);
			const tag = await getRasterMetadata(dataset, titilerUrl);
			if (!tag) continue;
			dataset_tag[dataset.properties.id] = tag;
		}
		console.log(dataset_tag);

		const dbManager = new DatabaseManager(database);
		try {
			const client = await dbManager.transactionStart();

			const insertTags = Object.keys(dataset_tag).map((key) => dataset_tag[key]);
			console.log(`${insertTags.length} tags found`);

			const tags = new Tags(insertTags);
			const latestTags = await tags.insert(client);
			Object.keys(dataset_tag)?.forEach((key) => {
				const x = dataset_tag[key];
				const tag = latestTags.find((y) => y.value === x.value && y.key === x.key);
				x.id = tag?.id;
			});

			await insertDatasetTags(client, dataset_tag);
			console.log(`${Object.keys(dataset_tag).length} tags inserted to dataset_tag`);

			tags.cleanup(client);
		} catch {
			await dbManager.transactionRollback();
		} finally {
			await dbManager.transactionEnd();
		}

		console.timeEnd('cog-unit');
	});

export default program;

const getRasterDatasets = async () => {
	const apiUrl = 'https://dev.undpgeohub.org/api/datasets?type=azure&limit=9999';
	const res = await fetch(apiUrl);
	const json: DatasetFeatureCollection = await res.json();
	const rasters = json.features.filter((f) => f.properties.is_raster === true);
	return rasters;
};

const getRasterMetadata = async (feature: DatasetFeature, titilerUrl: string) => {
	const apiUrl = `${titilerUrl}/cog/info?url=${getBase64EncodedUrl(feature.properties.url)}`;
	const res = await fetch(apiUrl);
	if (!res.ok) return;
	const json: RasterTileMetadata = await res.json();
	const band_metadata = json.band_metadata;
	let unit: string | undefined;
	band_metadata?.forEach((band) => {
		band.forEach((data: string | BandMetadata) => {
			if (data instanceof String) return;
			const metadata = data as BandMetadata;
			if (!metadata['Unit']) return;
			unit = metadata.Unit.trim();
		});
	});
	if (!unit) return;

	const tag: Tag = {
		key: 'unit',
		value: unit
	};

	return tag;
};

const insertDatasetTags = async (client: PoolClient, dataset_tag: { [key: string]: Tag }) => {
	const ids = Object.keys(dataset_tag);
	for (const id of ids) {
		const t = dataset_tag[id];
		const sql = `INSERT INTO geohub.dataset_tag (dataset_id, tag_id) values ('${id}', ${t.id})`;
		console.log(sql);
		await client.query({ text: sql });
	}
};
