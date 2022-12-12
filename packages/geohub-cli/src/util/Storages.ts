import { PoolClient } from 'pg';
import { concurrentPromise } from '../helpers';
import { Storage } from '../interfaces';
import Tags from './Tags';

class Storages {
	private storages: Storage[];
	public getStorages() {
		return this.storages;
	}

	constructor(storages: Storage[]) {
		this.storages = storages;
	}

	public addTags(tags: Tags) {
		const masterTags = tags.getTags();
		this.storages.forEach((storage) => {
			storage.tags.forEach((x) => {
				const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
				if (!tag) {
					tags.add(x);
				}
			});
		});
	}

	public updateTags(tags: Tags) {
		const masterTags = tags.getTags();
		this.storages.forEach((storage) => {
			storage.tags.forEach((x) => {
				const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
				x.id = tag?.id;
			});
		});
	}

	public async insertAll(client: PoolClient) {
		const promises = this.storages.map((storage) => this.upsert(client, storage));
		this.storages = await concurrentPromise(promises, 10);
		return this.storages;
	}

	public async upsert(client: PoolClient, storage: Storage) {
		let query = {
			text: `
                INSERT INTO geohub.storage (id, name, url, label, description, icon) 
                values ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id)
                DO
                UPDATE SET name=$2, url=$3, label=$4, description=$5, icon=$6`,
			values: [
				storage.id,
				storage.name,
				storage.url,
				storage.label,
				storage.description,
				storage.icon
			]
		};
		await client.query(query);

		// insert storage_tag
		query = {
			text: `DELETE FROM geohub.storage_tag WHERE storage_id=$1`,
			values: [storage.id]
		};
		await client.query(query);

		if (storage.tags.length > 0) {
			const sql = `
            INSERT INTO geohub.storage_tag (storage_id, tag_id) values ${storage.tags
							.map((t) => `('${storage.id}', ${t.id})`)
							.join(',')}`;
			await client.query({ text: sql });
		}
		return storage;
	}

	public async clearAll(client: PoolClient, storageIds: string[]) {
		const queryStorageTag = {
			text: `
			DELETE FROM geohub.storage_tag as a
			WHERE a.storage_id IN (${storageIds.map((id) => `'${id}'`).join(',')})
			`
		};
		await client.query(queryStorageTag);

		const queryStorage = {
			text: `DELETE FROM geohub.storage WHERE id IN (${storageIds
				.map((id) => `'${id}'`)
				.join(',')})`
		};
		await client.query(queryStorage);
	}
}

export default Storages;
