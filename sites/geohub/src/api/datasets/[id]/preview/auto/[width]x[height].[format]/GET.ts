import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { error, type RequestEvent } from '@sveltejs/kit';
import { Output as _Output, Query as _Query, CommonParam as _Param } from '../../shared';
import { env } from '$env/dynamic/private';
import type { StyleSpecification } from 'maplibre-gl';

export const Output = _Output;
export const Query = _Query;
export const Param = _Param;

export const Error = {
	400: apiError(400, `Invalid parameters`),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a preview image for the dataset by using the default location';
	c.description = `This endpoint is to create a preview image for the dataset. The default location saved in the dataset will be used automatically.`;
	c.tags = ['datasets'];
	return c;
};

export default async function (
	param: z.infer<typeof Param & typeof Query>,
	{ fetch, url }: RequestEvent
): Promise<Response> {
	const width = Number(param.width);
	const height = Number(param.height);

	const ratio = param.ratio ? Number(param.ratio as string) : 1;
	if (!(ratio === 1 || ratio === 2)) {
		error(400, 'ratio should be either 1 or 2.');
	}

	const format = param.format;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		error(400, 'Unsupported format.');
	}

	const id = param.id;

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/auto/${width}x${height}.${format}?ratio=${ratio}`;

	const previewUrl = `${url.origin}/api/datasets/${id}/preview/style.json${url.search}`;

	let image;
	if (url.origin.indexOf('localhost') !== -1) {
		// if localhost, use POST method
		const resStyleJson = await fetch(previewUrl);
		const styleJson: StyleSpecification = await resStyleJson.json();
		const res = await fetch(apiUrl, {
			method: 'POST',
			body: JSON.stringify(styleJson)
		});
		if (!res.ok) {
			error(res.status, { message: res.statusText });
		}
		image = await res.blob();
	} else {
		// Use GET method
		const staticApi = `${apiUrl}&url=${encodeURIComponent(previewUrl)}`;
		const res = await fetch(staticApi);
		if (!res.ok) {
			error(res.status, { message: res.statusText });
		}
		image = await res.blob();
	}

	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
}
