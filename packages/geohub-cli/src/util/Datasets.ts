import { PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import wkx from 'wkx';
import fs from 'fs';
import path from 'path';
import { Dataset } from '../interfaces';
import Tags from './Tags';
import { cleanText, distinct } from '../helpers';

const APP_NAME = 'geohub-cli';

class Datasets {
	private datasets: Dataset[];
	public getDatasets() {
		return this.datasets;
	}

	private tmpDir: string;

	constructor(datasets: Dataset[], tmpDir?: string) {
		this.datasets = datasets;
		this.tmpDir = tmpDir ?? __dirname;
	}

	public addTags(tags: Tags) {
		const masterTags = tags.getTags();
		this.datasets.forEach((dataset) => {
			dataset.tags?.forEach((x) => {
				const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
				if (!tag) {
					tags.add(x);
				}
			});
		});
	}

	public updateTags(tags: Tags) {
		const masterTags = tags.getTags();
		this.datasets.forEach((dataset) => {
			dataset.tags?.forEach((x) => {
				const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
				x.id = tag?.id;
			});
		});
	}

	private async getDeleteIds(client: PoolClient) {
		if (this.datasets.length === 0) return;

		// consider all datasets are the same `type`
		const first = this.datasets[0];
		const type = first?.tags?.find((t) => t.key === 'type');
		if (!type) return [];

		let query: { text: string; values: string[] };
		if (type.value === 'azure') {
			const containerTags = this.datasets.map((data) => {
				return data.tags?.find((t) => t.key === 'container');
			});
			if (!containerTags) return [];
			const ids = containerTags.map((c) => c?.value).filter(distinct);

			query = {
				text: `
				SELECT b.dataset_id
				FROM geohub.tag as a 
				INNER JOIN geohub.dataset_tag as b
				ON a.id = b.tag_id
				WHERE a.key = 'type' and a.value = $1
				INTERSECT
				SELECT b.dataset_id
				FROM geohub.tag as a 
				INNER JOIN geohub.dataset_tag as b
				ON a.id = b.tag_id
				WHERE a.key = 'container' and a.value IN (${ids.map((id) => `'${id}'`).join(',')})
				`,
				values: [type.value]
			};
		} else if (type.value === 'stac') {
			const stacTag = first.tags?.find((t) => t.key === 'stac');
			if (!stacTag) return [];

			query = {
				text: `
				SELECT b.dataset_id
				FROM geohub.tag as a 
				INNER JOIN geohub.dataset_tag as b
				ON a.id = b.tag_id
				WHERE a.key = 'type' and a.value = $1
				INTERSECT
				SELECT b.dataset_id
				FROM geohub.tag as a 
				INNER JOIN geohub.dataset_tag as b
				ON a.id = b.tag_id
				WHERE a.key = 'stac' and a.value = $2
				`,
				values: [type.value, stacTag.value]
			};
		} else {
			query = {
				text: `
				SELECT dataset_id 
				FROM geohub.dataset_tag
				WHERE EXISTS (
					SELECT id 
					FROM geohub.tag 
					WHERE id=tag_id 
					AND key='type' 
					AND value=$1
				)
				`,
				values: [type.value]
			};
		}

		const res = await client.query(query);
		const ids: string[] = res.rows.map((row) => row.dataset_id);
		return ids;
	}

	public async insertAll(client: PoolClient) {
		const ids = await this.getDeleteIds(client);
		if (ids && ids.length > 0) {
			await this.clearAll(client, ids);
		}

		this.datasets = await this.bulkInsert(client, this.datasets);
		await this.bulkInsertTabs(client, this.datasets);
		return this.datasets;
	}

	private bulkInsert(client: PoolClient, datasets: Dataset[]) {
		const tsvFile = path.resolve(this.tmpDir, `datasets.tsv`);
		if (fs.existsSync(tsvFile)) {
			fs.unlinkSync(tsvFile);
		}
		datasets.forEach((dataset) => {
			const wkt = `POLYGON((${dataset.bounds[0]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[1]}))`;
			const geometry = wkx.Geometry.parse(wkt);

			const values = [
				dataset.id,
				dataset.url,
				dataset.name,
				cleanText(dataset.description),
				dataset.is_raster,
				cleanText(dataset.license),
				Buffer.from(geometry.toWkb()).toString('hex'),
				dataset.createdat,
				APP_NAME,
				dataset.updatedat,
				APP_NAME
			];
			fs.appendFileSync(tsvFile, `${values.join('\t')}\n`);
		});

		return new Promise<Dataset[]>((resolve, reject) => {
			const stream = client.query(
				copyFrom(
					'COPY geohub.dataset (id, url, name, description, is_raster, license, bounds, createdat, created_user, updatedat, updated_user ) FROM STDIN'
				)
			);
			const fileStream = fs.createReadStream(tsvFile);
			fileStream.on('error', reject);
			stream.on('error', reject);
			stream.on('finish', () => {
				resolve(datasets);
			});
			fileStream.pipe(stream);
		});
	}

	private bulkInsertTabs(client: PoolClient, datasets: Dataset[]) {
		const tsvFile = path.resolve(this.tmpDir, `datasets_tags.tsv`);
		if (fs.existsSync(tsvFile)) {
			fs.unlinkSync(tsvFile);
		}
		const exported: string[] = [];
		datasets.forEach((dataset) => {
			if (dataset.tags && dataset.tags.length > 0) {
				dataset.tags.forEach((tag) => {
					const values = [dataset.id, tag.id];
					if (exported.includes(values.join(','))) return;
					exported.push(values.join(','));
					fs.appendFileSync(tsvFile, `${values.join('\t')}\n`);
				});
			}
		});

		return new Promise<Dataset[]>((resolve, reject) => {
			const stream = client.query(
				copyFrom('COPY geohub.dataset_tag (dataset_id, tag_id) FROM STDIN')
			);
			const fileStream = fs.createReadStream(tsvFile);
			fileStream.on('error', reject);
			stream.on('error', reject);
			stream.on('finish', () => {
				resolve(datasets);
			});
			fileStream.pipe(stream);
		});
	}

	public async clearAll(client: PoolClient, datasetIds: string[]) {
		if (datasetIds.length === 0) return;

		const queryDatasetTag = {
			text: `
			DELETE FROM geohub.dataset_tag as a
			WHERE a.dataset_id IN (${datasetIds.map((id) => `'${id}'`).join(',')})
			`
		};
		await client.query(queryDatasetTag);

		const queryDataset = {
			text: `DELETE FROM geohub.dataset WHERE id IN (${datasetIds
				.map((id) => `'${id}'`)
				.join(',')})`
		};
		await client.query(queryDataset);
	}

	public async insert(client: PoolClient, dataset: Dataset) {
		const wkt = `POLYGON((${dataset.bounds[0]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[1]},
			${dataset.bounds[2]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[1]}))`;
		const query = {
			text: `
			INSERT INTO geohub.dataset (id, url, name, description, is_raster, license, bounds, createdat, created_user, updatedat, updated_user) 
			values ($1, $2, $3, $4, $5, $6, ST_GeomFROMTEXT('${wkt}', 4326), $7::timestamptz, $8, $9::timestamptz, $10)`,
			values: [
				dataset.id,
				dataset.url,
				dataset.name,
				cleanText(dataset.description),
				dataset.is_raster,
				cleanText(dataset.license),
				dataset.createdat,
				APP_NAME,
				dataset.updatedat,
				APP_NAME
			]
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await client.query(query);

		// insert storage_tag
		if (dataset.tags && dataset.tags.length > 0) {
			const sql = `
			INSERT INTO geohub.dataset_tag (dataset_id, tag_id) values ${dataset.tags
				.map((t) => `('${dataset.id}', ${t.id})`)
				.join(',')}`;
			await client.query({ text: sql });
		}

		return dataset;
	}

	public async upsert(client: PoolClient, dataset: Dataset) {
		const wkt = `POLYGON((${dataset.bounds[0]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[1]},
			${dataset.bounds[2]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[1]}))`;
		let query = {
			text: `
			INSERT INTO geohub.dataset (
			  id, 
			  url, 
			  name, 
			  description, 
			  is_raster, 
			  license, 
			  bounds, 
			  createdat, 
			  created_user,
			  updatedat,
			  updated_user
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4, 
			  $5, 
			  $6, 
			  ST_GeomFROMTEXT('${wkt}', 4326), 
			  $7::timestamptz, 
			  $8,
			  $9::timestamptz,
			  $10
			) 
			ON CONFLICT (id)
			DO
			UPDATE
			 SET
			  url=$2, 
			  name=$3, 
			  description=$4, 
			  is_raster=$5, 
			  license=$6, 
			  bounds=ST_GeomFROMTEXT('${wkt}', 4326), 
			  createdat=$7::timestamptz, 
			  updatedat=$9::timestamptz,
			  updated_user=$10`,
			values: [
				dataset.id,
				dataset.url,
				dataset.name,
				dataset.description,
				dataset.is_raster,
				dataset.license,
				dataset.createdat,
				APP_NAME,
				dataset.updatedat,
				APP_NAME
			]
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await client.query(query);

		// insert storage_tag
		query = {
			text: `DELETE FROM geohub.dataset_tag WHERE dataset_id=$1`,
			values: [dataset.id]
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await client.query(query);

		if (dataset.tags && dataset.tags.length > 0) {
			const sql = `
			INSERT INTO geohub.dataset_tag (dataset_id, tag_id) values ${dataset.tags
				.map((t) => `('${dataset.id}', ${t.id})`)
				.join(',')}`;
			await client.query({ text: sql });
		}

		return dataset;
	}

	public async delete(client: PoolClient, datasetId: string) {
		const queryDatasetTag = {
			text: `
			DELETE FROM geohub.dataset_tag WHERE dataset_id = $1
			`,
			values: [datasetId]
		};
		await client.query(queryDatasetTag);

		const queryStar = {
			text: `DELETE FROM geohub.dataset_favourite WHERE dataset_id = $1`,
			values: [datasetId]
		};
		await client.query(queryStar);

		const queryPermission = {
			text: `DELETE FROM geohub.dataset_permission WHERE dataset_id = $1`,
			values: [datasetId]
		};
		await client.query(queryPermission);

		const queryDataset = {
			text: `DELETE FROM geohub.dataset WHERE id = $1`,
			values: [datasetId]
		};
		await client.query(queryDataset);
	}
}

export default Datasets;
