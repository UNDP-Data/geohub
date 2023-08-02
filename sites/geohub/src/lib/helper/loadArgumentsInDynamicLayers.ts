import { fetchUrl } from '$lib/helper/fetchUrl';

export const loadArgumentsInDynamicLayers = async (url: string) => {
	// const url = layerURL.toString()
	const metaUrl = url.replace('/{z}/{x}/{y}.pbf', '.json');
	const jsonString = await fetchUrl(metaUrl);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return JSON.parse(jsonString.arguments[0].default);
};
