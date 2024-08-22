import { PNG } from 'pngjs';
import type { SpriteIcon, SpriteImage } from '$lib/types';

export const clipSpriteServer = async (
	url: string,
	id: string,
	icon: SpriteIcon
): Promise<SpriteImage> => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch image: ${res.statusText}`);
	}

	const arrayBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const png = PNG.sync.read(buffer);
	const cropped = new PNG({ width: icon.width, height: icon.height });

	for (let y = 0; y < icon.height; y++) {
		for (let x = 0; x < icon.width; x++) {
			const idx = ((icon.y + y) * png.width + (icon.x + x)) << 2;
			const croppedIdx = (y * icon.width + x) << 2;

			cropped.data[croppedIdx] = png.data[idx];
			cropped.data[croppedIdx + 1] = png.data[idx + 1];
			cropped.data[croppedIdx + 2] = png.data[idx + 2];
			cropped.data[croppedIdx + 3] = png.data[idx + 3];
		}
	}

	const bufferOutput = PNG.sync.write(cropped);
	const base64 = bufferOutput.toString('base64');
	const dataUrl = `data:image/png;base64,${base64}`;

	return {
		src: dataUrl,
		alt: id
	};
};
