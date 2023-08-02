import { attribution } from '$lib/config/AppConfig';
import type { PgtileservDetailJson } from '$lib/types/PgtileservDetailJson';
import type { PgtileservIndexJson } from '$lib/types/PgtileservIndexJson';
import type { TileJson } from '$lib/types/TileJson';

export const getPgtileservTileJson = async (table: string, type: string, pgtileservUrl: string) => {
	const indexJson = await getIndexJson(table, pgtileservUrl);
	const detailUrl: string = indexJson.detailurl;
	const tilejson = await getTileJson(detailUrl);
	return tilejson;
};

const getIndexJson = async (table: string, pgtileservUrl: string) => {
	const url = `${pgtileservUrl}/index.json`;
	const res = await fetch(url);
	const json: PgtileservIndexJson = await res.json();
	return json[table];
};

const getTileJson = async (url: string) => {
	const res = await fetch(url);
	const json: PgtileservDetailJson = await res.json();
	const fields: { [key: string]: string } = {};
	json.properties?.forEach((prop) => {
		fields[prop.name] = `${prop.type}. ${prop.description}`;
	});

	const tilejson: TileJson = {
		tilejson: '3.0.0',
		name: `${json.id}`,
		description: json.description,
		version: '1.0.0',
		attribution: attribution,
		scheme: 'xyz',
		tiles: [json.tileurl],
		center: [0, 0, 0],
		bounds: [-180, -90, 180, 90],
		minzoom: json.minzoom,
		maxzoom: json.maxzoom,
		vector_layers: []
	};
	if (json.bounds) {
		tilejson.bounds = json.bounds;
	}
	if (json.center) {
		tilejson.center = [...json.center, (json.center[0] + json.center[1]) / 2];
	}
	if (json.geometrytype) {
		tilejson.geometrytype = json.geometrytype;
	}
	if (Object.keys(fields).length > 0) {
		tilejson.vector_layers = [
			{
				id: json.id,
				fields: fields,
				description: json.description,
				minzoom: json.minzoom,
				maxzoom: json.maxzoom
			}
		];
	}

	return tilejson;
};
