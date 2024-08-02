import type { StyleSpecification } from 'maplibre-gl';

export const getMapImageFromStyle = async (
	style: StyleSpecification,
	width: number,
	height: number,
	staticApiUrl: string
) => {
	const staticApi = `${staticApiUrl}/style/static/auto/${width}x${height}.webp`;
	const res = await fetch(staticApi, { method: 'POST', body: JSON.stringify(style) });
	if (!res.ok) {
		return '';
	}
	const blob = await res.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const base64String = arrayBufferToBase64(arrayBuffer);
	const dataUrl = `data:${blob.type};base64,${base64String}`;
	return dataUrl;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
};
