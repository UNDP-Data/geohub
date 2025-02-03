import { error, z, type RouteModifier } from 'sveltekit-api';
import { type RequestEvent } from '@sveltejs/kit';
import type { StyleSpecification } from 'maplibre-gl';
import { validateStyle } from '$lib/server/validateStyle';
import type { extensionFormat } from '$lib/server/renderMap';
import { Output as _Output, Query as _Query } from '$api/shared';
import { Param as _Param } from './shared';
import { renderMapAuto } from '$lib/server/renderMapAuto';

export const Output = _Output;
export const Query = _Query;
export const Param = _Param;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Static image with default location';
	c.description = `et static image by default location in style.json automatically`;
	c.tags = ['auto'];
	c.responses = {
		200: {
			description: 'Returning static image in a specific format (PNG, JPEG or WEBP)',
			content: {
				'application/octet-stream': {
					schema: z.string().describe('static image in a specific format (PNG, JPEG or WEBP)')
				}
			}
		},
		400: {
			description: 'Invalid parameter error'
		}
	};
	return c;
};

export default async function (
	param: z.infer<typeof Param>,
	{ fetch, url }: RequestEvent
): Promise<Response> {
	const width = Number(param.width);
	const height = Number(param.height);
	const ratio = Number(url.searchParams.get('ratio') ?? '1');
	if (!(ratio >= 1 && ratio <= 4)) {
		error(400, 'ratio should be between 1 and 4.');
	}

	const format = param.format as extensionFormat;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		error(400, 'Unsupported format.');
	}

	const styleUrl = url.searchParams.get('url') as string;

	if (!styleUrl) {
		error(400, `url query param is required.`);
	}

	const res = await fetch(styleUrl);
	const style: StyleSpecification = await res.json();

	const errors = validateStyle(style);
	if (errors.length) {
		error(400, errors.join(', '));
	}

	const image = await renderMapAuto(width, height, ratio, format, style, url);
	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
}
