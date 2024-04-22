import stylePackage from '@undp-data/style/package.json';
import type { SpriteSpecification } from 'maplibre-gl';

const resolveSprite = (sprite: string, origin: string) => {
	if (!sprite.startsWith('./')) {
		return sprite;
	}
	if (origin.indexOf('localhost') !== -1) {
		const version = stylePackage.version;
		const cdnOrigin = `https://cdn.jsdelivr.net/npm/@undp-data/style@${version}/dist/`;
		sprite = new URL(sprite, cdnOrigin).href;
	} else {
		sprite = new URL(sprite.replace('./', './api/mapstyle/'), origin).href;
	}

	return sprite;
};

export const resolveSpriteUrl = (sprite: SpriteSpecification, origin: string) => {
	if (Array.isArray(sprite)) {
		for (const s of sprite) {
			s.url = resolveSprite(s.url, origin);
		}
	} else {
		sprite = resolveSprite(sprite, origin);
	}
	return sprite;
};
