import Clipper from 'image-clipper';
import type { SpriteIcon, SpriteImage } from '../../types';
import canvas from 'canvas';

/**
 * Clip an image by id from sprite file image (server version)
 * @param url sprite image URL
 * @param id Sprite ID
 * @param icon sprite image data from json
 * @returns
 */
export const clipSpriteServer = (
	url: string,
	id: string,
	icon: SpriteIcon
): Promise<SpriteImage> => {
	return new Promise((resolve) => {
		Clipper.configure({ canvas: canvas });
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
