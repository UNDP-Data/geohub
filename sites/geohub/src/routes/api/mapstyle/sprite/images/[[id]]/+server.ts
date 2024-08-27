import type { RequestHandler } from './$types';
import spriteJson from '@undp-data/style/dist/sprite-non-sdf/sprite@2x.json';
import { clipSprite } from '$lib/server/helpers';
import type { SpriteIcon } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { SpriteImage } from '@undp-data/svelte-undp-components';

export const GET: RequestHandler = async ({ params, fetch, url }) => {
	const spritePngUrl = new URL(`/api/mapstyle/sprite-non-sdf/sprite@2x.png`, url.origin);

	const res = await fetch(spritePngUrl);
	const arrayBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const json: { [key: string]: SpriteIcon } = JSON.parse(JSON.stringify(spriteJson));

	const imageId = params.id ?? '';
	if (imageId.length > 0) {
		if (!json[imageId]) {
			error(404, { message: `sprite image (${imageId}) not found.` });
		}
		const image = await clipSprite(buffer, imageId, json[imageId]);
		return new Response(JSON.stringify(image));
	} else {
		const promises: Promise<SpriteImage>[] = [];
		Object.keys(json).forEach((id) => {
			promises.push(clipSprite(buffer, id, json[id]));
		});

		const imageList = await Promise.all(promises);

		return new Response(JSON.stringify(imageList));
	}
};
