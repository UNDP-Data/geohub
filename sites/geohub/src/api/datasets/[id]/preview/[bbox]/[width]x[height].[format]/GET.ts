import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { type RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Output as _Output, Query as _Query, CommonParam } from '../../shared';
import type { StyleSpecification } from 'maplibre-gl';

export const Output = _Output;
export const Query = _Query;
export const Param = CommonParam.merge(
	z.object({
		bbox: z
			.string()
			.describe('bbox (minx, miny, maxx, maxy)')
			.openapi({ example: '-4.04296875,-15.114552871944102,48.69140625,19.476950206488414' })
	})
);

export const Error = {
	400: apiError(400, `Invalid parameters`),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a preview image for the dataset by using specific BBOX';
	c.description = `This endpoint is to create a preview image for the dataset by specifing the BBOX boundary`;
	c.tags = ['datasets'];
	return c;
};

export default async function (
	param: z.infer<typeof Param & typeof Query>,
	{ fetch, url }: RequestEvent
): Promise<Response> {
	const bbox = param.bbox;
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

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/${bbox}/${width}x${height}.${format}?ratio=${ratio}`;

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
		const res = await fetch(`${apiUrl}&url=${encodeURIComponent(previewUrl)}`);
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
