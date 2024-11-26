import type {
	CircleLayerSpecification,
	FillExtrusionLayerSpecification,
	FillLayerSpecification,
	HeatmapLayerSpecification,
	HillshadeLayerSpecification,
	LineLayerSpecification,
	Map,
	RasterLayerSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

export const updateParamsInURL = (
	layerStyle:
		| RasterLayerSpecification
		| FillLayerSpecification
		| LineLayerSpecification
		| SymbolLayerSpecification
		| HeatmapLayerSpecification
		| CircleLayerSpecification
		| FillExtrusionLayerSpecification
		| HillshadeLayerSpecification,
	layerURL: URL,
	params: Record<string, string>,
	map: Map
) => {
	Object.keys(params).forEach((key) => {
		layerURL.searchParams.set(key, params[key]);
	});

	if ('getStyle' in map) {
		const style = map.getStyle();

		if (style?.sources) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			style.sources[layerStyle.source].tiles = [decodeURI(layerURL.toString())];
			// delete all props which have undefined value
			// probably it is a bug of maplibre to add undefined property (like url, bounds) to the style,
			// and maplibre complains it has error which some of properties are not defined.
			Object.keys(style.sources).forEach((key) => {
				const src = style.sources[key];
				Object.keys(src).forEach((prop) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (!src[prop]) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						delete src[prop];
					}
				});
			});
			map.setStyle(style);
		}
	}
};
