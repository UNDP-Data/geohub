import type { Sprite, SpriteImage } from '$lib/types';
import { clipSprite } from './clipSprite';
import { fetchUrl } from './fetchUrl';
import { loadImageToDataUrl } from './loadImageToDataUrl';

export const getSpriteImageList = (spriteUrl: string) => {
	return new Promise<SpriteImage[]>((resolve) => {
		const styleUrl = spriteUrl.replace('/sprite/sprite', '/sprite-non-sdf/sprite');
		const promise = Promise.all([
			loadImageToDataUrl(`${styleUrl}@4x.png`),
			fetchUrl(`${styleUrl}@4x.json`)
		]);
		promise
			.then(([dataUrl, json]) => {
				const sprite: Sprite = {
					dataUrl,
					json
				};
				return sprite;
			})
			.then((sprite: Sprite) => {
				const promises = [];
				Object.keys(sprite.json).forEach((id) => {
					promises.push(clipSprite(sprite.dataUrl, id, sprite.json[id]));
				});
				return Promise.all(promises);
			})
			.then((iconList) => {
				resolve(iconList);
			});
	});
};
