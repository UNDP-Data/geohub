import Clipper from 'image-clipper';
import type { SpriteIcon, SpriteImage } from '../types';

export const clipSprite = (url: string, id: string, icon: SpriteIcon): Promise<SpriteImage> => {
	return new Promise((resolve) => {
		Clipper(url, function () {
			this.crop(icon.x, icon.y, icon.width, icon.height).toDataURL(function (dataUrl: string) {
				resolve({
					src: dataUrl,
					alt: id
				});
			});
		});
	});
};
