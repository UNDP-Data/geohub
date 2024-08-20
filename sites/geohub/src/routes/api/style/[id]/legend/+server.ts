import type { RequestHandler } from './$types';
import type {
	BandMetadata,
	DashboardMapStyle,
	Layer,
	RasterTileMetadata,
	VectorLayerSpecification,
	VectorTileMetadata
} from '$lib/types';
import { convertFunctionToExpression, getActiveBandIndex, isRgbRaster } from '$lib/helper';
import { error } from '@sveltejs/kit';
import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import chroma from 'chroma-js';
import { LegendCreator } from './LegendCreator';

interface LegendLayer {
	id: string;
	name: string;
	legend: string;
	// layer: VectorLayerSpecification | RasterLayerSpecification;
	// source: SourceSpecification;
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	const styleId = Number(params.id);
	if (!styleId) {
		return new Response(JSON.stringify({ message: `id parameter is required.` }), {
			status: 400
		});
	}

	const res = await fetch(`/api/style/${styleId}`);
	if (!res.ok) {
		const body = await res.json();
		error(res.status, body);
	}
	const style: DashboardMapStyle = await res.json();

	const layers: LegendLayer[] = [];

	style.layers?.forEach((geohubLayer) => {
		const maplibreLayer: VectorLayerSpecification | RasterLayerSpecification =
			style.style?.layers.find((l) => l.id === geohubLayer.id) as
				| VectorLayerSpecification
				| RasterLayerSpecification;
		if (!maplibreLayer) return;
		const maplibreSource = style.style?.sources[maplibreLayer.source];
		if (!maplibreSource) return;
		const visibility = maplibreLayer.layout?.visibility ?? 'visible';
		if (visibility === 'none') return;

		const legend =
			maplibreLayer.type === 'raster'
				? (getRasterLayerLegend(geohubLayer, maplibreSource as RasterSourceSpecification) as string)
				: getVectorLayerLegend(geohubLayer, maplibreLayer);

		layers.push({
			id: geohubLayer.id,
			name: geohubLayer.name,
			legend
		});
	});

	return new Response(JSON.stringify(layers));
};

const getRasterLayerLegend = (geohubLayer: Layer, source: RasterSourceSpecification) => {
	const metadata: RasterTileMetadata = geohubLayer.info as RasterTileMetadata;
	const isRgbTile = isRgbRaster(metadata.colorinterp as string[]);

	const sourceUrl = (source.tiles ? source.tiles[0] : source.url) as string;
	const url = new URL(sourceUrl);

	const algorithmId = url.searchParams.get('algorithm');

	let legend = '';
	if (!isRgbTile && !algorithmId) {
		const colormap_name = url.searchParams.get('colormap_name');
		const colormapString = url.searchParams.get('colormap');
		let colormap: number[][][] | { [key: string]: number[] } = [];
		if (colormapString) {
			if (Array.isArray(colormapString)) {
				// interval
				colormap = JSON.parse(colormapString) as number[][][];
			} else {
				// unique
				colormap = JSON.parse(colormapString) as unknown as { [key: string]: number[] };
			}
		}

		const bandIndex = getActiveBandIndex(metadata);
		let bandMetaStats: BandMetadata | undefined = undefined;
		if (metadata && metadata['band_metadata'][bandIndex]) {
			bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
		}

		const unit = geohubLayer.dataset?.properties.tags?.find((t) => t.key === 'unit')
			?.value as string;

		const creator = new LegendCreator();

		if (colormap_name) {
			// linear color legend
			const min = bandMetaStats?.STATISTICS_MINIMUM;
			const max = bandMetaStats?.STATISTICS_MAXIMUM;

			const isReverse = colormap_name.indexOf('_r') !== -1;
			let colors = chroma.scale(colormap_name.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
			if (isReverse) {
				colors = colors.reverse();
			}

			legend = creator.generateLinearLegend(colors, { unit, min, max });
		} else if (colormap) {
			if (Array.isArray(colormap)) {
				// categorised numeric value legend
				const values: number[][] = colormap.map((c) => c[0]);
				const colors = colormap.map((c) => c[1]) as [number, number, number, number][];
				legend = creator.getCategorizedLegend(colors, values, { unit });
			} else {
				// unique value legend
				let uniqueValueColors: { [key: string]: string } = {};

				if (bandMetaStats) {
					uniqueValueColors = bandMetaStats['STATISTICS_UNIQUE_VALUES'] as {
						[key: string]: string;
					};
				}

				const values: string[] = Object.keys(colormap).map((k) => {
					return uniqueValueColors[k] ?? k;
				}) as string[];
				const colors = Object.values(colormap).map((c) => c) as [number, number, number, number][];

				legend = creator.getUniqueValueLegend(colors, values);
			}
		}
	} else {
		// RGB legend or algorithm

		const links = geohubLayer.dataset?.properties.links;
		const titilerBaseUrl = links?.find((l) => l.rel === 'cog')?.href;
		if (titilerBaseUrl) {
			const infoUrl = links.find((l) => l.rel === 'info')?.href;
			if (!infoUrl) return;
			const fileUrl = new URL(infoUrl).searchParams.get('url') as string;

			const previewUrl = new URL(`${titilerBaseUrl}/preview`);
			previewUrl.searchParams.set('url', fileUrl);

			if (algorithmId) {
				previewUrl.searchParams.set('algorithm', algorithmId);

				const algorithm_params = url.searchParams.get('algorithm_params') as string;
				if (algorithm_params?.length > 0) {
					previewUrl.searchParams.set('algorithm_params', algorithm_params);
				}
			}

			previewUrl.searchParams.set('height', `${64}`);
			previewUrl.searchParams.set('width', `${64}`);

			legend = previewUrl.href;
		}
	}

	return legend.replace(/\n/g, '').replace(/\t/g, '');
};

const getVectorPropertyNames = (layer: VectorLayerSpecification) => {
	const names = {
		color: '',
		opacity: '',
		shape: ''
	};

	if (layer.type === 'fill') {
		names.color = 'fill-color';
		names.opacity = 'fill-opacity';
		const lineColor = layer.paint ? layer.paint['fill-outline-color'] : '{color}';
		names.shape = `<rect x='0' y='0' width='{size}' height='{size}' fill='{color}' stroke='${lineColor}' stroke-width='1' />`;
	} else if (layer.type === 'line') {
		names.color = 'line-color';
		names.opacity = 'line-opacity';

		let lineWidth = layer.paint ? layer.paint['line-width'] : undefined;
		if (typeof lineWidth !== 'number') {
			lineWidth = 1;
		}
		names.shape = `<line x1='0' y1='{size}' x2='{size}' y2='0' stroke='{color}' stroke-width='${lineWidth}' />`;
	} else if (layer.type === 'fill-extrusion') {
		names.color = 'fill-extrusion-color';
		names.opacity = 'fill-extrusion-opacity';
		names.shape = `<rect x='0' y='0' width='{size}' height='{size}' fill='{color}' stroke='{color}' stroke-width='1' />`;
	} else if (layer.type === 'circle') {
		names.color = 'circle-color';
		names.opacity = 'circle-opacity';
		const strokeColor = layer.paint ? layer.paint['circle-stroke-color'] : '{color}';
		const strokeWidth = layer.paint ? layer.paint['circle-stroke-width'] : '1';
		names.shape = `<circle cx='{size}' cy='{size}' r='{size}' fill='{color}' stroke='${strokeColor}' stroke-width='${strokeWidth}' />`;
	} else if (layer.type === 'heatmap') {
		names.color = 'heatmap-color';
		names.opacity = 'heatmap-opacity';
	} else if (layer.type === 'symbol') {
		names.color = 'icon-color';
		names.opacity = 'icon-opacity';
	}

	return {
		colors: layer.paint ? layer.paint[names.color] : undefined,
		opacity: layer.paint ? layer.paint[names.opacity] : undefined,
		shape: names.shape
	};
};

const getDecimalPlaces = (value: number) => {
	let decimalPlaces = 0;

	if (value !== undefined && typeof value === 'number') {
		const valueString = value.toString();
		if (valueString.includes('.')) {
			decimalPlaces = valueString.split('.')[1].length;
		}
	}
	return decimalPlaces;
};

const getVectorLayerLegend = (geohubLayer: Layer, vectorLayer: VectorLayerSpecification) => {
	const data = getVectorPropertyNames(vectorLayer);

	const metadata: VectorTileMetadata = geohubLayer.info as VectorTileMetadata;
	const tilestats = metadata.json?.tilestats;
	const layerStats = tilestats?.layers.find((l) => l.layer === vectorLayer['source-layer']);

	// console.log(data);
	let svgString = '';

	data.colors = convertFunctionToExpression(data.colors, undefined);

	if (Array.isArray(data.colors)) {
		// expression
		const exprType = data.colors[0];
		if (exprType === 'match') {
			const title = data.colors[1][1];
			const steps = data.colors.slice(2);

			const colors: string[] = [];
			const values: string[] = [];

			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i + 1] ? steps[i + 1] : steps[i];
				let value = steps[i + 1] ? steps[i] : undefined;
				if (!value) {
					value = 'Others';
				}

				colors.push(color);
				values.push(value);
			}

			const creator = new LegendCreator();
			svgString = creator.getUniqueValueLegend(colors, values, { unit: title, shape: data.shape });
		} else if (exprType === 'step') {
			const title = data.colors[1][1];
			const steps = data.colors.slice(2);

			const attrStats = layerStats?.attributes.find((attr) => attr.attribute === title);
			const min = attrStats?.min;
			const max = attrStats?.max;

			const colors: string[] = [];
			const values: number[][] = [];
			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i];
				const value = steps[i + 1];

				const ranges: number[] = [];
				if (i === 0) {
					if (min !== undefined) {
						const decimalPlaces = getDecimalPlaces(value);
						ranges.push(Number(min.toFixed(decimalPlaces)));
					}
					ranges.push(value);
				} else if (value === undefined) {
					ranges.push(steps[i - 1]);
					if (max) {
						const decimalPlaces = getDecimalPlaces(ranges[0]);
						ranges.push(Number(max.toFixed(decimalPlaces)));
					}
				} else {
					ranges.push(steps[i - 1]);
					ranges.push(value);
				}
				colors.push(color);
				values.push(ranges);
			}

			const creator = new LegendCreator();
			svgString = creator.getCategorizedLegend(colors, values, { unit: title, shape: data.shape });
		} else if (exprType === 'interpolate') {
			// heatmap
			const title = data.colors[2][0].replace(/-/g, ' ');
			const steps = data.colors.slice(4);
			const colors: string[] = [];
			const values: number[][] = [];
			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i];
				const value = i === 0 ? 0 : steps[i - 1];
				colors.push(color);
				values.push([value]);
			}
			const creator = new LegendCreator();
			svgString = creator.getCategorizedLegend(colors, values, { unit: title, shape: data.shape });
		}
	} else {
		// single color
		const creator = new LegendCreator();
		svgString = creator.getSVG(
			data.shape
				.replace('{color}', data.colors)
				.replace(/{size}/g, vectorLayer.type === 'circle' ? '15' : '30'),
			30
		);
	}

	return svgString;
};
