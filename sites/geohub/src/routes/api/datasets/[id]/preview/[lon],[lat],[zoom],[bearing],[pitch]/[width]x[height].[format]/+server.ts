import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { StyleSpecification } from 'maplibre-gl';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const lon = Number(params.lon);
	const lat = Number(params.lat);
	const zoom = Number(params.zoom);
	const bearing = Number(params.bearing);
	const pitch = Number(params.pitch);
	const width = Number(params.width);
	const height = Number(params.height);

	const ratio = url.searchParams.get('ratio') ? Number(url.searchParams.get('ratio')) : 1;
	if (!(ratio === 1 || ratio === 2)) {
		throw error(400, 'ratio should be either 1 or 2.');
	}

	const format = params.format;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		throw error(400, 'Unsupported format.');
	}

	const id = params.id;

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/${lon},${lat},${zoom},${bearing},${pitch}/${width}x${height}.${format}?ratio=${ratio}`;

	let image;
	if (url.origin.indexOf('localhost') !== -1) {
		// if localhost, use POST method
		const resStyleJson = await fetch(`/api/datasets/${id}/preview/style.json${url.search}`);
		const styleJson: StyleSpecification = await resStyleJson.json();

		const res = await fetch(apiUrl, {
			method: 'POST',
			body: JSON.stringify(styleJson)
		});
		if (!res.ok) {
			throw error(res.status, { message: res.statusText });
		}
		image = await res.blob();
	} else {
		// Use GET method
		const res = await fetch(
			`${apiUrl}&url=${encodeURIComponent(
				`${url.origin}api/datasets/${id}/preview/style.json${url.search}`
			)}`
		);
		if (!res.ok) {
			throw error(res.status, { message: res.statusText });
		}
		image = await res.blob();
	}

	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
};
