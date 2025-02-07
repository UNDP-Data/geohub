import { error, z, type RouteModifier } from 'sveltekit-api';
import { type RequestEvent } from '@sveltejs/kit';
import type { StyleSpecification } from 'maplibre-gl';
import { validateStyle } from '$lib/server/validateStyle';
import type { extensionFormat } from '$lib/server/renderMap';
import { Output as _Output, Input as _Input, PostQuery as _Query } from '$api/shared';
import { CommonParam as _Param } from '$api/shared';
import { renderMapAuto } from '$lib/server/renderMapAuto';

export const Output = _Output;
export const Query = _Query;
export const Input = _Input;
export const Param = _Param;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Static image with default location';
	c.description = `get static image by default location in style.json automatically`;
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
	input: z.infer<typeof Query & typeof Param>,
	{ url, request }: RequestEvent
): Promise<Response> {
	const width = Number(input.width);
	const height = Number(input.height);
	const ratio = Number(url.searchParams.get('ratio') ?? '1');
	if (!(ratio >= 1 && ratio <= 4)) {
		error(400, 'ratio should be between 1 and 4.');
	}
	const format = input.format as extensionFormat;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		error(400, 'Unsupported format.');
	}

	const style: StyleSpecification = await request.json();

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
