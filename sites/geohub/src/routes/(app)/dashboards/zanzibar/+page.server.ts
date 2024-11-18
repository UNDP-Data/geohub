import type { PageServerLoad } from './$types';
import type { DashboardMapStyle } from '$lib/types';
import { fail } from '@sveltejs/kit';
import { geojson } from 'flatgeobuf';
import type { LngLatBoundsLike, LngLatLike, MapGeoJSONFeature } from 'maplibre-gl';
import type { LocationSwitchPlaces } from '$components/pages/map/plugins/MaplibreLocationSwitchControl.svelte';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const styleId = 377;
	const styleUrl = `/api/style/${styleId}`;
	const blogUrl =
		'https://www.undp.org/tanzania/blog/using-crowd-mapping-and-mobile-survey-unravel-unfrequented-tourist-attractions';
	const socialImage = `${url.origin}/assets/zanzibar-snapshot.png`;

	const res = await fetch(styleUrl);
	const style: DashboardMapStyle = await res.json();
	const center: LngLatLike = [39.58, -5.6472];
	const zoom = 6;
	const maxExtent: LngLatBoundsLike = [
		[38.8971, -6.893],
		[40.0507, -4.5757]
	];
	const places: LocationSwitchPlaces[] = [
		{
			name: 'Unguja (main) island',
			bounds: [
				[38.967079, -6.524425],
				[39.714149, -5.621784]
			]
		},
		{
			name: 'Pemba Island',
			bounds: [
				[39.436798, -5.502539],
				[39.984741, -4.81047]
			]
		},
		{
			name: 'Stone town',
			bounds: [
				[39.181479, -6.176574],
				[39.206842, -6.150078]
			]
		}
	];

	return {
		title: 'Zanzibar Tourism | Dashboards | GeoHub',
		content: 'Zanzibar Tourism',
		site_description: `This dashboard maps the beauty of the world famous and popular destination - Zanzibar, Tanzania. The UNDP Accelerator Lab collaborated with OpenMap Development Tanzania and the State University of Zanzibar's youth mappers chapter to map unpopular tourist attractions with the goal of assessing the existing situation through crowd mapping and mobile surveys.`,
		style: style,
		center,
		zoom,
		maxExtent,
		places,
		blogUrl,
		socialImage
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
				place_type: [placeType]
			};

			features.push(point);
		}
		return JSON.stringify({ features });
	}
};
