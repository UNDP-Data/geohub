import type { DatasetFeature } from '$lib/types';
import DatabaseManager from '$lib/server/DatabaseManager';
import TagManager from '$lib/server/TagManager';
import DatasetManager from '$lib/server/DatasetManager';

export const upsertDataset = async (feature: DatasetFeature) => {
	const dbm = new DatabaseManager();
	try {
		console.debug(`dataset (id=${feature.properties.id}) started registering`);
		const client = await dbm.transactionStart();

		const dsManager = new DatasetManager(feature);

		const tags: TagManager = new TagManager();

		dsManager.addTags(tags);

		await tags.insert(client);
		console.debug(`${tags.getTags().length} tags were registered into PostGIS.`);

		dsManager.updateTags(tags);

		await dsManager.upsert(client);
		console.debug(`dataset (id=${feature.properties.id}) was registered into PostGIS.`);

		await tags.cleanup(client);
		console.debug(`unused tags were cleaned`);

		console.debug(`dataset (id=${feature.properties.id}) ended registering`);
	} catch (e) {
		console.error(e);
		await dbm.transactionRollback();
		throw e;
	} finally {
		await dbm.transactionEnd();
	}
};
