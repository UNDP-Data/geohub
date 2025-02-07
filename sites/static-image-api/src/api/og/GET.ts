import { error, z, type RouteModifier } from 'sveltekit-api';
import { type RequestEvent } from '@sveltejs/kit';
import { renderMap } from '$lib/server/renderMap';
import type sharp from 'sharp';
import type { RenderOptions } from '@maplibre/maplibre-gl-native';
import { validateStyle } from '$lib/server/validateStyle';
import type { StyleSpecification } from 'maplibre-gl';
import { Output as _Output } from '$api/shared';

export const Output = _Output;

export const Query = z.object({
	url: z.string().describe('URL of style.json').openapi({
		example: 'https:/dev.undpgeohub.org/api/mapstyle/style.json'
	}),
	content: z.string().optional().describe('Content for og image')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Generate a OG image';
	c.description = `Generate a OG image by givern style.json and content text`;
	c.tags = ['og'];
	c.responses = {
		200: {
			description: 'Returning static image in PNG format',
			content: {
				'application/octet-stream': {
					schema: z.string().describe('static image in PNG format')
				}
			}
		},
		400: {
			description: 'url query param is missing or maplibre style is invalid'
		}
	};
	return c;
};

export default async function (
	query: z.infer<typeof Query>,
	{ fetch, url }: RequestEvent
): Promise<Response> {
	const width = 1200;
	const height = 630;
	const ratio = 1;
	const format = 'png';

	const styleUrl = query.url;

	if (!styleUrl) {
		error(400, 'url query param is required.');
	}

	const content = query.content;

	const res = await fetch(styleUrl);
	const style: StyleSpecification = await res.json();

	const errors = validateStyle(style);
	if (errors.length) {
		error(400, errors.join(', '));
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
		}
	];

	if (content && content.length > 0) {
		overlayImages.push({
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
		});
	}

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
}

const getLogoImage = async (
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>
) => {
	const res = await fetch('/assets/undp-images/undp-logo-blue.png');
	const blob = await res.blob();
	const buffer = await blob.arrayBuffer();
	return Buffer.from(buffer);
};
