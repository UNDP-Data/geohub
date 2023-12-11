import type { RequestHandler } from './$types';
import type { StyleSpecification } from 'maplibre-gl';
import { error } from '@sveltejs/kit';
import { validateStyle } from '$lib/server/validateStyle';
import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { renderMap } from '$lib/server/renderMap';
import type sharp from 'sharp';

export const GET: RequestHandler = async ({ fetch, url }) => {
	const width = 1200;
	const height = 630;
	const ratio = 1;
	const format = 'png';

	const styleUrl = url.searchParams.get('url');

	if (!styleUrl) {
		throw error(400, { message: `url query param is required.` });
	}

	const content = url.searchParams.get('content');
	if (!content) {
		throw error(400, { message: `content query param is required.` });
	}

	const res = await fetch(styleUrl);
	const style: StyleSpecification = await res.json();

	const errors = validateStyle(style);
	if (errors.length) {
		throw error(400, { message: errors.join(', ') });
	}

	const center: [number, number] = (style.center as [number, number]) ?? [0, 0];
	const zoom = style.zoom ?? 0;
	const bearing = style.bearing ?? 0;
	const pitch = style.pitch ?? 0;

	const mapOptions: RenderOptions = {
		zoom: zoom,
		width: width,
		height: height,
		center: center,
		bearing: bearing,
		pitch: pitch
	};

	const logo = await getLogoImage(fetch);

	const overlayImages: sharp.OverlayOptions[] = [
		{
			input: logo,
			gravity: 'northwest',
			top: 10,
			left: 10
		},
		{
			input: {
				text: {
					text: `<span foreground="#000000">${content}</span>`,
					font: 'Proximanova Regular',
					fontfile: '/fonts/proximanova-regular-webfont.woff',
					width: 1100,
					height: 120,
					align: 'left',
					rgba: true
				}
			},
			top: 280,
			left: 50,
			tile: false,
			// blend: 'overlay',
			gravity: 'west'
		}
	];

	const image = await renderMap(
		url,
		style,
		mapOptions,
		width,
		height,
		ratio,
		format,
		overlayImages
	);

	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
};

const getLogoImage = async (
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>
) => {
	const res = await fetch('/assets/undp-images/undp-logo-blue.png');
	const blob = await res.blob();
	const buffer = await blob.arrayBuffer();
	return Buffer.from(buffer);
};
