import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import spriteJson from '@undp-data/style/dist/sprite-non-sdf/sprite@2x.json';
import type { SpriteIcon } from '$lib/types/SpriteIcon';
import { error } from '@sveltejs/kit';
import { clipSprite } from '$lib/server/helpers/clipSprite';
import type { IconImageType } from '@undp-data/svelte-undp-components';

export const Param = z.object({
	id: z
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.enum(Object.keys(spriteJson))
		.optional()
		.describe('Sprite image ID.')
});

export const Output = z
	.custom<IconImageType[] | IconImageType>()
	.describe('The list of sprite images with data URL and image name')
	.openapi({
		examples: [
			{
				src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABE0lEQVR4AeXBP0ocYRwA0De/DAEbg6V/wq7TegNB7GNra+sN0lt6BPcCuUAKT+ANLFKEcRbFUpNOF+O6MAMfQhxUmHxF3pNL4X2WcIA7fMOD1gpGGGOETYwxxgjn2LFQeptljHCML1pf8QdjfNJvrlN4bgmrqFChQoUKa1jV7w7XqFGjRo0aNW51CskZtvX7jQYltrS+4wgNbrxSKXnEL0zRoMEFpmgwxa3WR9xr7WPmjUrJjtebSWbeIWQSMgmZFJI9TLBuGFc4xKmFkJxg3XA2MNEJyYbhfdYJmZReVug31yr0m/uLkEnIJGQSMgmZhExCJoVk7t8oLIRMQiYhk5BcGd6lzgfJD+xi2TAucYif/ktPaJ8yCaIF03cAAAAASUVORK5CYII=',
				alt: 'aerialway'
			},
			[
				{
					src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABE0lEQVR4AeXBP0ocYRwA0De/DAEbg6V/wq7TegNB7GNra+sN0lt6BPcCuUAKT+ANLFKEcRbFUpNOF+O6MAMfQhxUmHxF3pNL4X2WcIA7fMOD1gpGGGOETYwxxgjn2LFQeptljHCML1pf8QdjfNJvrlN4bgmrqFChQoUKa1jV7w7XqFGjRo0aNW51CskZtvX7jQYltrS+4wgNbrxSKXnEL0zRoMEFpmgwxa3WR9xr7WPmjUrJjtebSWbeIWQSMgmZFJI9TLBuGFc4xKmFkJxg3XA2MNEJyYbhfdYJmZReVug31yr0m/uLkEnIJGQSMgmZhExCJoVk7t8oLIRMQiYhk5BcGd6lzgfJD+xi2TAucYif/ktPaJ8yCaIF03cAAAAASUVORK5CYII=',
					alt: 'aerialway'
				}
			]
		]
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a sprite image data URL by image ID';
	c.description = 'Get a sprite image data URL by image ID';
	c.tags = ['BaseMapStyle'];
	return c;
};

export const getSpriteImage = async (url: URL, id?: string) => {
	const spritePngUrl = new URL(`/api/mapstyle/sprite-non-sdf/sprite@2x.png`, url.origin);

	const res = await fetch(spritePngUrl);
	const arrayBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const json: { [key: string]: SpriteIcon } = JSON.parse(JSON.stringify(spriteJson));

	const imageId = id ?? '';
	if (imageId.length > 0) {
		if (!json[imageId]) {
			error(404, { message: `sprite image (${imageId}) not found.` });
		}
		const image = await clipSprite(buffer, imageId, json[imageId]);
		return image;
	} else {
		const promises: Promise<IconImageType>[] = [];
		Object.keys(json).forEach((id) => {
			promises.push(clipSprite(buffer, id, json[id]));
		});

		const imageList = await Promise.all(promises);

		return imageList;
	}
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { url }) => {
	return getSpriteImage(url, param.id);
});
