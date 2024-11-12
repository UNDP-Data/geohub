import type { PageServerLoad } from './$types';
import type { DashboardMapStyle } from '$lib/types';
import { fail } from '@sveltejs/kit';
import { geojson } from 'flatgeobuf';
import bbox from '@turf/bbox';
import type { MapGeoJSONFeature } from 'maplibre-gl';

export const load: PageServerLoad = async ({ fetch }) => {
	const styleId = 372;
	const styleUrl = `/api/style/${styleId}`;

	const res = await fetch(styleUrl);
	const style: DashboardMapStyle = await res.json();

	return {
		title: 'Zanzibar Tourism | Dashboards | GeoHub',
		content: 'Zanzibar Tourism Dashboard',
		style: style
	};
};

export const actions = {
	geocoder_data: async ({ request }) => {
		const data = await request.formData();
		const fgbUrl = data.get('fgb')?.toString();

		if (!fgbUrl) {
			return fail(400, { message: 'fgb is missing' });
		}

		const iter = geojson.deserialize(fgbUrl, { minX: -180, minY: -90, maxX: 180, maxY: 90 });
		const features = [];
		for await (const feature of iter) {
			const f = feature as unknown as MapGeoJSONFeature;
			const placeName = [
				f.properties['name'],
				f.properties['type tourism'],
				f.properties['addr region']
			];
			const center = 'coordinates' in f.geometry ? f.geometry.coordinates[0] : [];
			const placeType = f.properties['type tourism'];

			const point = {
				type: 'Feature',
				id: f.properties['index'],
				geometry: {
					type: 'Point',
					coordinates: center
				},
				place_name: placeName.join(', '),
				properties: feature.properties,
				text: placeName.join(', '),
				place_type: [placeType],
				bbox: bbox(feature) as [number, number, number, number]
			};

			features.push(point);
		}
		return JSON.stringify({ features });
	}
};
