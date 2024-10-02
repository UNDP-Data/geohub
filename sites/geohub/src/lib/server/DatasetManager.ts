import type { DatasetFeature } from '$lib/types';
import TagManager from './TagManager';
import { Permission } from '$lib/config/AppConfig';
import { DatasetPermissionManager } from './DatasetPermissionManager';
import { db, type TransactionSchema } from '$lib/server/db';
import { datasetFavouriteInGeohub, datasetInGeohub, datasetTagInGeohub } from './schema';
import { eq, sql } from 'drizzle-orm';

class DatasetManager {
	private dataset: DatasetFeature;
	public getDataset() {
		return this.dataset;
	}

	constructor(dataset: DatasetFeature) {
		this.dataset = dataset;
	}

	public addTags(tags: TagManager) {
		const masterTags = tags.getTags();
		this.dataset.properties.tags?.forEach((x) => {
			const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
			if (!tag) {
				tags.add(x);
			}
		});
	}

	public updateTags(tags: TagManager) {
		const masterTags = tags.getTags();
		this.dataset.properties.tags?.forEach((x) => {
			const tag = masterTags.find((y) => y.value === x.value && y.key === x.key);
			x.id = tag?.id;
		});
	}

	public async upsert() {
		if (!this.dataset) return;
		const datasetId = this.dataset.properties.id as string;
		await db.transaction(async (tx) => {
			if (!this.dataset) return;

			console.debug(`dataset (id=${datasetId}) started registering`);

			const tags: TagManager = new TagManager();

			this.addTags(tags);

			await tags.insert(tx as TransactionSchema);
			console.debug(`${tags.getTags().length} tags were registered into PostGIS.`);

			this.updateTags(tags);

			const rings = this.dataset.geometry?.coordinates as [number, number][][];
			const coordinates = rings[0];
			const wkt = `POLYGON((
				${coordinates[0].join(' ')},
				${coordinates[1].join(' ')},
				${coordinates[2].join(' ')},
				${coordinates[3].join(' ')},
				${coordinates[4].join(' ')}
			))`;

			await tx
				.insert(datasetInGeohub)
				.values({
					id: datasetId,
					url: this.dataset.properties.url,
					name: this.dataset.properties.name,
					description: this.dataset.properties.description,
					isRaster: this.dataset.properties.is_raster,
					license: this.dataset.properties.license,
					bounds: sql.raw(`ST_GeomFROMTEXT('${wkt}', 4326)`),
					accessLevel: this.dataset.properties.access_level,
					createdat: this.dataset.properties.createdat,
					createdUser: this.dataset.properties.created_user
				})
				.onConflictDoUpdate({
					target: [datasetInGeohub.id],
					set: {
						url: this.dataset.properties.url,
						name: this.dataset.properties.name,
						description: this.dataset.properties.description,
						isRaster: this.dataset.properties.is_raster,
						license: this.dataset.properties.license,
						bounds: sql.raw(`ST_GeomFROMTEXT('${wkt}', 4326)`),
						accessLevel: this.dataset.properties.access_level,
						updatedat: this.dataset.properties.updatedat,
						updatedUser: this.dataset.properties.updated_user
					}
				});

			console.debug(`updated dataset table`);

			await tx.delete(datasetTagInGeohub).where(eq(datasetTagInGeohub.datasetId, datasetId));
			console.debug(`deleted dataset_tag table`);

			if (this.dataset.properties.tags && this.dataset.properties.tags.length > 0) {
				for (const tag of this.dataset.properties.tags) {
					await tx.insert(datasetTagInGeohub).values({
						datasetId: datasetId,
						tagId: tag.id
					});
				}
				console.debug(`updated dataset_tag table`);
			}

			// if it is new data (no permission settings in the table yet), insert user email address as an owner of the dataset.
			const dpm = new DatasetPermissionManager(
				datasetId,
				this.dataset.properties.updated_user as string
			);
			const permissions = await dpm.getAll();
			if (permissions.length === 0) {
				await dpm.register(
					{
						dataset_id: datasetId,
						user_email: this.dataset.properties.updated_user as string,
						permission: Permission.OWNER
					},
					tx as TransactionSchema
				);
				console.debug(`added ${this.dataset.properties.updated_user} as an owner of the dataset`);
			}
			console.debug(`dataset (id=${datasetId}) was registered into PostGIS.`);

			await tags.cleanup(tx as TransactionSchema);
			console.debug(`unused tags were cleaned`);

			console.debug(`dataset (id=${datasetId}) ended registering`);
		});

		return this.dataset;
	}

	public async delete(datasetId: string) {
		console.debug(`started deleting ${datasetId}`);

		await db.transaction(async (tx) => {
			await tx.delete(datasetTagInGeohub).where(eq(datasetTagInGeohub.datasetId, datasetId));
			console.debug(`deleted it from dataset_tag table`);

			await tx
				.delete(datasetFavouriteInGeohub)
				.where(eq(datasetFavouriteInGeohub.datasetId, datasetId));
			console.debug(`deleted it from dataset_favourite table`);

			await tx.delete(datasetInGeohub).where(eq(datasetInGeohub.id, datasetId));
			console.debug(`deleted it from dataset table`);
		});

		console.debug(`ended deleting ${datasetId}`);
	}
}

export default DatasetManager;
