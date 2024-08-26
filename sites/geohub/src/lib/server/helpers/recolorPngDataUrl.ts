import chroma from 'chroma-js';
import { PNG } from 'pngjs';

/**
 * Recolors a black PNG image with the specified RGBA color and returns the new image as a Data URL.
 *
 * @param {string} dataUrl - The original PNG image as a Data URL (base64 encoded).
 * @param {[number, number, number, number]} rgba - The RGBA color array to recolor the black pixels.
 *  - rgba[0]: Red value (0-255)
 *  - rgba[1]: Green value (0-255)
 *  - rgba[2]: Blue value (0-255)
 *  - rgba[3]: Alpha value (0-255)
 * @returns {Promise<string>} A promise that resolves to the new PNG image as a Data URL.
 */
export const recolorPngDataUrl = (
	dataUrl: string,
	rgba: [number, number, number, number] | string
): Promise<string> => {
	const colors = chroma(rgba as unknown as number[]).rgba();
	const alpha = Math.round(colors[3] * 255);

	return new Promise((resolve, reject) => {
		// Decode the base64 part of the data URL
		const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
		const buffer = Buffer.from(base64Data, 'base64');

		// Parse the PNG image
		const png = new PNG();
		png.parse(buffer, (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			// Iterate over each pixel in the image
			for (let y = 0; y < data.height; y++) {
				for (let x = 0; x < data.width; x++) {
					const idx = (data.width * y + x) << 2;

					// If the pixel is black, recolor it with the provided RGBA value
					const isNearlyBlack =
						data.data[idx] <= 10 && data.data[idx + 1] <= 10 && data.data[idx + 2] <= 10;
					const isOpaqueEnough = data.data[idx + 3] >= 1;
					if (isNearlyBlack && isOpaqueEnough) {
						data.data[idx] = colors[0]; // Red
						data.data[idx + 1] = colors[1]; // Green
						data.data[idx + 2] = colors[2]; // Blue
						data.data[idx + 3] = alpha; // Alpha
					}
				}
			}

			// Pack the PNG image into a buffer
			const chunks: Buffer[] = [];
			png
				.pack()
				.on('data', (chunk) => chunks.push(chunk))
				.on('end', () => {
					const outputBuffer = Buffer.concat(chunks);
					// Convert the buffer back to a Data URL
					const outputDataUrl = `data:image/png;base64,${outputBuffer.toString('base64')}`;
					resolve(outputDataUrl);
				});
		});
	});
};

/**
 * Recolors a black PNG image with the specified RGBA color and returns the new image as a new SVG.
 *
 * @param {string} dataUrl - The original PNG image as a Data URL (base64 encoded).
 * @param {[number, number, number, number]} rgba - The RGBA color array to recolor the black pixels.
 *  - rgba[0]: Red value (0-255)
 *  - rgba[1]: Green value (0-255)
 *  - rgba[2]: Blue value (0-255)
 *  - rgba[3]: Alpha value (0-255)
 * @returns {Promise<string>} A promise that resolves to the new PNG image as a new SVG.
 */
export const recolorPngToSvg = async (
	dataUrl: string,
	rgba: [number, number, number, number] | string
) => {
	const recolored = await recolorPngDataUrl(dataUrl, rgba);
	const svg = `
			<image xlink:href='${recolored}' width='{size}' height='{size}' />`;
	return svg;
};
