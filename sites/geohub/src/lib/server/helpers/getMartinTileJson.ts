import { attribution } from '$lib/config/AppConfig';
import type { MartinLayerMetadata } from '$lib/types/MartinLayerMetadata';
import type { TileJson } from '$lib/types/TileJson';

export const getMartinTileJson = async (table: string, martinUrl: string) => {
	const indexJson = await getIndexJson(table, martinUrl);
	if (!indexJson) {
		return;
	}
	// convert tilejson v2.2.0 to v3.0.0
	const tilejson = await getTileJson(table, indexJson, martinUrl);
	return tilejson;
};

const getIndexJson = async (table: string, martinUrl: string) => {
	const url = `${martinUrl}/index.json`;
	const res = await fetch(url);
	const json: { [key: string]: MartinLayerMetadata } = await res.json();
	return json[table];
};

const getTileJson = async (table: string, indexJson: MartinLayerMetadata, martinUrl: string) => {
	const url = `${martinUrl}/${table}.json`;
	const res = await fetch(url);
	const tilejson: TileJson = await res.json();
	if (!res.ok) {
		throw new Error(res.statusText);
	}

	const fields: { [key: string]: string } = {};
	Object.keys(indexJson.properties).forEach((key) => {
		let dataType = indexJson.properties[key];
		switch (dataType) {
			case 'varchar':
			case 'text':
			case 'char':
			case 'name':
				dataType = 'string';
				break;
			case 'float4':
			case 'float8':
			case 'int2':
			case 'int4':
			case 'numeric':
				dataType = 'number';
				break;
		}
		fields[key] = `${key} with ${dataType} data type`;
	});
	(tilejson.tilejson = '3.0.0'),
		(tilejson.description = `${table} data from PostGIS via martin server`);
	tilejson.attribution = attribution;
	tilejson.geometrytype = indexJson.geometry_type;

	switch (tilejson.geometrytype.toLocaleLowerCase()) {
		case 'multipoint':
			tilejson.geometrytype = 'point';
			break;
		case 'multilinestring':
			tilejson.geometrytype = 'line';
			break;
		case 'multipolygon':
			tilejson.geometrytype = 'polygon';
			break;
	}

	tilejson.vector_layers = [
		{
			id: table,
			fields: fields,
			description: tilejson.description,
			minzoom: tilejson.minzoom,
			maxzoom: tilejson.maxzoom
		}
	];

	return tilejson;
};
