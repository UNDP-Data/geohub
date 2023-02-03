import { PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import wkx from 'wkx';
import fs from 'fs';
import path from 'path';
import { Dataset } from '../interfaces';
import Tags from './Tags';
import { cleanText } from '../helpers';

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

	public async insertAll(client: PoolClient) {
		const storageIds = this.datasets.map((dataset) => dataset.storage.id);
		const ids: string[] = [];
		storageIds.forEach((id) => {
			if (ids.includes(id)) return;
			ids.push(id);
		});
		await this.clearAll(client, ids);

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
				dataset.storage.id,
				dataset.url,
				dataset.name,
				cleanText(dataset.description),
				dataset.is_raster,
				cleanText(dataset.source),
				cleanText(dataset.license),
				Buffer.from(geometry.toWkb()).toString('hex'),
				dataset.createdat,
				dataset.updatedat
			];
			fs.appendFileSync(tsvFile, `${values.join('\t')}\n`);
		});

		return new Promise<Dataset[]>((resolve, reject) => {
			const stream = client.query(
				copyFrom(
					'COPY geohub.dataset (id, storage_id, url, name, description, is_raster, source, license, bounds, createdat, updatedat ) FROM STDIN'
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
		datasets.forEach((dataset) => {
			if (dataset.tags && dataset.tags.length > 0) {
				dataset.tags.forEach((tag) => {
					const values = [dataset.id, tag.id];
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

	public async clearAll(client: PoolClient, storageIds: string[]) {
		const queryDatasetTag = {
			text: `
			WITH datasetIds as (
				SELECT a.dataset_id as id 
				FROM geohub.dataset_tag a 
				INNER JOIN geohub.dataset b 
				ON a.dataset_id = b.id
				WHERE b.storage_id IN (${storageIds.map((id) => `'${id}'`).join(',')})
			)
			DELETE FROM geohub.dataset_tag as a
			USING datasetIds as b
			WHERE a.dataset_id = b.id
			`
		};
		await client.query(queryDatasetTag);

		const queryDataset = {
			text: `DELETE FROM geohub.dataset WHERE storage_id IN (${storageIds
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
			INSERT INTO geohub.dataset (id, storage_id, url, name, description, is_raster, source, license, bounds, createdat, updatedat) 
			values ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFROMTEXT('${wkt}', 4326), $9::timestamptz, $9::timestamptz)`,
			values: [
				dataset.id,
				dataset.storage.id,
				dataset.url,
				dataset.name,
				cleanText(dataset.description),
				dataset.is_raster,
				cleanText(dataset.source),
				cleanText(dataset.license),
				dataset.createdat,
				dataset.updatedat
			]
		};
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
			  storage_id, 
			  url, 
			  name, 
			  description, 
			  is_raster, 
			  source, 
			  license, 
			  bounds, 
			  createdat, 
			  updatedat
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4, 
			  $5, 
			  $6, 
			  $7, 
			  $8, 
			  ST_GeomFROMTEXT('${wkt}', 4326), 
			  $9::timestamptz, 
			  $10::timestamptz
			) 
			ON CONFLICT (id)
			DO
			UPDATE
			 SET
			  storage_id=$2,
			  url=$3, 
			  name=$4, 
			  description=$5, 
			  is_raster=$6, 
			  source=$7, 
			  license=$8, 
			  bounds=ST_GeomFROMTEXT('${wkt}', 4326), 
			  createdat=$9::timestamptz, 
			  updatedat=$10::timestamptz`,
			values: [
				dataset.id,
				dataset.storage.id,
				dataset.url,
				dataset.name,
				dataset.description,
				dataset.is_raster,
				dataset.source,
				dataset.license,
				dataset.createdat,
				dataset.updatedat
			]
		};
		await client.query(query);

		// insert storage_tag
		query = {
			text: `DELETE FROM geohub.dataset_tag WHERE dataset_id=$1`,
			values: [dataset.id]
		};
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

		const queryDataset = {
			text: `DELETE FROM geohub.dataset WHERE id = $1`,
			values: [datasetId]
		};
		await client.query(queryDataset);
	}
}

export default Datasets;
