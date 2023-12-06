import type { RequestHandler } from './$types';
import type { StyleSpecification } from 'maplibre-gl';
import { renderMapAuto } from '$lib/server/renderMapAuto';
import { error } from '@sveltejs/kit';
import { validateStyle } from '$lib/server/validateStyle';
import type { extensionFormat } from '$lib/server/renderMap';

export const GET: RequestHandler = async ({ params, url }) => {
	const width = Number(params.width);
	const height = Number(params.height);
	const ratio = url.searchParams.get('ratio') ? Number(url.searchParams.get('ratio')) : 1;
	if (!(ratio >= 1 && ratio <= 4)) {
		throw error(400, 'ratio should be between 1 and 4.');
	}
	const format = params.format as extensionFormat;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		throw error(400, 'Unsupported format.');
	}

	const styleUrl = url.searchParams.get('url');

	if (!styleUrl) {
		throw error(400, { message: `url query param is required.` });
	}

	const res = await fetch(styleUrl);
	const style: StyleSpecification = await res.json();

	const errors = validateStyle(style);
	if (errors.length) {
		throw error(400, { message: errors.join(', ') });
	}

	const image = await renderMapAuto(width, height, ratio, format, style, url);
	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
};

export const POST: RequestHandler = async ({ params, url, request }) => {
	const width = Number(params.width);
	const height = Number(params.height);
	const ratio = url.searchParams.get('ratio') ? Number(url.searchParams.get('ratio')) : 1;
	if (!(ratio >= 1 && ratio <= 4)) {
		throw error(400, 'ratio should be between 1 and 4.');
	}
	const format = params.format as extensionFormat;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		throw error(400, 'Unsupported format.');
	}

	const style: StyleSpecification = await request.json();

	const errors = validateStyle(style);
	if (errors.length) {
		throw error(400, { message: errors.join(', ') });
	}

	const image = await renderMapAuto(width, height, ratio, format, style, url);
	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
};
