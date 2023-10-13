import type { StacCollection } from '$lib/types';

export const getStacClassmap = async (baseUrl: string, collectionId: string, asset: string) => {
	const classesMap = {};
	const collectionUrl = `${baseUrl}/${collectionId}`;
	const res = await fetch(collectionUrl);
	const collection: StacCollection = await res.json();
	// FixME: There is no standard object for the classes labels.
	if (collection.item_assets[asset]) {
		let classesObj;
		if (collection.item_assets[asset]['classification:classes']) {
			classesObj = collection.item_assets[asset]['classification:classes'];
		} else if (collection.item_assets[asset]['file:values']) {
			classesObj = collection.item_assets[asset]['file:values'];
		} else {
			return classesMap;
		}

		if (!classesObj) {
			return classesMap;
		}
		classesObj.forEach((item) => {
			if (item['description']) {
				classesMap[item['value']] = item['description'];
			} else if (item['summary']) {
				classesMap[item['values']] = item['summary'];
			} else {
				return;
			}
		});
	}
	return classesMap;
};
