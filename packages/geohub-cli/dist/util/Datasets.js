"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_copy_streams_1 = require("pg-copy-streams");
const wkx_1 = __importDefault(require("wkx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("../helpers");
const APP_NAME = 'geohub-cli';
class Datasets {
    datasets;
    getDatasets() {
        return this.datasets;
    }
    tmpDir;
    constructor(datasets, tmpDir) {
        this.datasets = datasets;
        this.tmpDir = tmpDir ?? __dirname;
    }
    addTags(tags) {
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
    updateTags(tags) {
        const masterTags = tags.getTags();
        this.datasets.forEach((dataset) => {
            dataset.tags?.forEach((x) => {
                const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
                x.id = tag?.id;
            });
        });
    }
    async getDeleteIds(client) {
        if (this.datasets.length === 0)
            return;
        // consider all datasets are the same `type`
        const first = this.datasets[0];
        const type = first?.tags?.find((t) => t.key === 'type');
        if (!type)
            return [];
        let query;
        if (type.value === 'azure') {
            const containerTags = this.datasets.map((data) => {
                return data.tags?.find((t) => t.key === 'container');
            });
            if (!containerTags)
                return [];
            const ids = containerTags.map((c) => c?.value).filter(helpers_1.distinct);
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
        }
        else if (type.value === 'stac') {
            const stacTag = first.tags?.find((t) => t.key === 'stac');
            if (!stacTag)
                return [];
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
        }
        else {
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
        const ids = res.rows.map((row) => row.dataset_id);
        return ids;
    }
    async insertAll(client) {
        const ids = await this.getDeleteIds(client);
        if (ids && ids.length > 0) {
            await this.clearAll(client, ids);
        }
        this.datasets = await this.bulkInsert(client, this.datasets);
        await this.bulkInsertTabs(client, this.datasets);
        return this.datasets;
    }
    bulkInsert(client, datasets) {
        const tsvFile = path_1.default.resolve(this.tmpDir, `datasets.tsv`);
        if (fs_1.default.existsSync(tsvFile)) {
            fs_1.default.unlinkSync(tsvFile);
        }
        datasets.forEach((dataset) => {
            const wkt = `POLYGON((${dataset.bounds[0]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[1]},${dataset.bounds[2]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[3]},${dataset.bounds[0]} ${dataset.bounds[1]}))`;
            const geometry = wkx_1.default.Geometry.parse(wkt);
            const values = [
                dataset.id,
                dataset.url,
                dataset.name,
                (0, helpers_1.cleanText)(dataset.description),
                dataset.is_raster,
                (0, helpers_1.cleanText)(dataset.license),
                Buffer.from(geometry.toWkb()).toString('hex'),
                dataset.createdat,
                APP_NAME,
                dataset.updatedat,
                APP_NAME
            ];
            fs_1.default.appendFileSync(tsvFile, `${values.join('\t')}\n`);
        });
        return new Promise((resolve, reject) => {
            const stream = client.query((0, pg_copy_streams_1.from)('COPY geohub.dataset (id, url, name, description, is_raster, license, bounds, createdat, created_user, updatedat, updated_user ) FROM STDIN'));
            const fileStream = fs_1.default.createReadStream(tsvFile);
            fileStream.on('error', reject);
            stream.on('error', reject);
            stream.on('finish', () => {
                resolve(datasets);
            });
            fileStream.pipe(stream);
        });
    }
    bulkInsertTabs(client, datasets) {
        const tsvFile = path_1.default.resolve(this.tmpDir, `datasets_tags.tsv`);
        if (fs_1.default.existsSync(tsvFile)) {
            fs_1.default.unlinkSync(tsvFile);
        }
        const exported = [];
        datasets.forEach((dataset) => {
            if (dataset.tags && dataset.tags.length > 0) {
                dataset.tags.forEach((tag) => {
                    const values = [dataset.id, tag.id];
                    if (exported.includes(values.join(',')))
                        return;
                    exported.push(values.join(','));
                    fs_1.default.appendFileSync(tsvFile, `${values.join('\t')}\n`);
                });
            }
        });
        return new Promise((resolve, reject) => {
            const stream = client.query((0, pg_copy_streams_1.from)('COPY geohub.dataset_tag (dataset_id, tag_id) FROM STDIN'));
            const fileStream = fs_1.default.createReadStream(tsvFile);
            fileStream.on('error', reject);
            stream.on('error', reject);
            stream.on('finish', () => {
                resolve(datasets);
            });
            fileStream.pipe(stream);
        });
    }
    async clearAll(client, datasetIds) {
        if (datasetIds.length === 0)
            return;
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
    async insert(client, dataset) {
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
                (0, helpers_1.cleanText)(dataset.description),
                dataset.is_raster,
                (0, helpers_1.cleanText)(dataset.license),
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
    async upsert(client, dataset) {
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
    async delete(client, datasetId) {
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
exports.default = Datasets;
