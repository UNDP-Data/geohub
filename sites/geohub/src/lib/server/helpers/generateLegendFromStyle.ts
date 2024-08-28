import {
	convertFunctionToExpression,
	fetchUrl,
	getActiveBandIndex,
	getDecimalPlaces,
	isRgbRaster
} from '$lib/helper';
import chroma from 'chroma-js';
import { hexToCSSFilter } from 'hex-to-css-filter';
import { SvgLegendCreator, type SvgLegendCreatorOptions } from '$lib/server/SvgLegendCreator';
import type {
	BandMetadata,
	DashboardMapStyle,
	Layer,
	RasterTileMetadata,
	SpriteIcon,
	VectorLayerSpecification,
	VectorTileMetadata
} from '$lib/types';
import type {
	HillshadeLayerSpecification,
	RasterLayerSpecification,
	RasterSourceSpecification,
	SpriteSpecification
} from 'maplibre-gl';
import { layerTypes } from '@undp-data/svelte-maplibre-storymap';
import { clipSprite } from './clipSprite';
import { recolorPngToSvg } from './recolorPngDataUrl';

/**
 * LegendLayer interface to contain layer legend information
 */
export interface LegendLayer {
	id: string;
	name: string;
	legend: string;
	layer: Layer;
	raw?: {
		min?: number;
		max?: number;
		unit?: string;
		colors?: [number, number, number, number][] | string[];
		values?: number[][] | string[];
		shape?: string;
	};
}

/**
 * Generate SVG Legend image for each layer from the saved style
 * @param style DashboardMapStyle object from the database
 * @param debug If true, include `raw` property in the response.
 * @param visibleOnly if true, return only layers visible or opacity is not zero. Default is false
 * @returns Returns an array of LegendLayer objects.
 */
export const generateLegendFromStyle = async (
	style: DashboardMapStyle,
	debug = false,
	visibleOnly = false,
	width = '100%'
) => {
	const layers: LegendLayer[] = [];
	if (!style.layers) return layers;
	for (const geohubLayer of style.layers) {
		const maplibreLayer:
			| VectorLayerSpecification
			| RasterLayerSpecification
			| HillshadeLayerSpecification = style.style?.layers.find((l) => l.id === geohubLayer.id) as
			| VectorLayerSpecification
			| RasterLayerSpecification
			| HillshadeLayerSpecification;
		if (!maplibreLayer) continue;
		const maplibreSource = style.style?.sources[maplibreLayer.source];
		if (!maplibreSource) continue;
		if (visibleOnly) {
			const visibility = maplibreLayer.layout?.visibility ?? 'visible';
			if (visibility === 'none') continue;

			const opacityProps = maplibreLayer.type !== 'hillshade' ? layerTypes[maplibreLayer.type] : '';
			if (opacityProps) {
				const firstProp = opacityProps[0];
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const opacity = maplibreLayer.layout[firstProp] ?? 1;
				if (opacity === 0) continue;
			}
		}

		const res = ['raster', 'hillshade'].includes(maplibreLayer.type)
			? await getRasterLayerLegend(
					geohubLayer,
					maplibreLayer as RasterLayerSpecification | HillshadeLayerSpecification,
					maplibreSource as RasterSourceSpecification,
					width
				)
			: await getVectorLayerLegend(
					geohubLayer,
					maplibreLayer as VectorLayerSpecification,
					style.style?.sprite as SpriteSpecification,
					width
				);

		const layer: LegendLayer = {
			id: geohubLayer.id,
			name: geohubLayer.name,
			legend: res?.legend as string,
			layer: geohubLayer
		};
		if (debug) {
			layer.raw = {
				min: res?.min,
				max: res?.max,
				unit: res?.unit,
				shape: res?.shape
					?.replace(/\n/g, '')
					.replace(/\t/g, '')
					.replace(/\n/g, '')
					.replace(/\s{2,}/g, ' ')
			};
			if (!(res?.colors?.length === 0)) {
				layer.raw.colors = res?.colors;
			}
			if (!(res?.values?.length === 0)) {
				layer.raw.values = res?.values;
			}
		}

		layers.push(layer);
	}
	return layers;
};

const getRasterLayerLegend = async (
	geohubLayer: Layer,
	layer: RasterLayerSpecification | HillshadeLayerSpecification,
	source: RasterSourceSpecification,
	width: string
) => {
	let legend = '';
	const creatorOption: SvgLegendCreatorOptions = {
		width
	};

	if (layer.type === 'hillshade') {
		const size = 30;
		const shadowColor = layer.paint
			? (layer.paint['hillshade-shadow-color'] as unknown as string)
			: '';

		legend = `
		<svg xmlns='http://www.w3.org/2000/svg' width='${size}px' height='${size}px'  viewBox='0 -960 960 960' fill='${shadowColor}'>
			<path d='m46-160 138-276q10-20 28.5-32t41.5-12q24 0 44 12.5t29 35.5l27 66q2 6 9 5.5t9-6.5l86-287q14-48 53.5-77t89.5-29q49 0 87.5 28.5T742-657l173 497h-85L666-632q-8-23-25-35.5T601-680q-23 0-40.5 13T535-631l-86 287q-9 28-32.5 46T363-280q-27 0-50-14.5T280-335l-27-66-118 241H46Zm194-400q-50 0-85-35.5T120-680q0-50 35-85t85-35q50 0 85 35t35 85q0 49-35 84.5T240-560Zm0-80q17 0 28.5-11.5T280-680q0-17-11.5-28.5T240-720q-17 0-28.5 11.5T200-680q0 17 11.5 28.5T240-640Zm123 360ZM240-680Z'/>
		</svg>
		`;

		const creator = new SvgLegendCreator();
		legend = creator.getSVG(legend, size, `${size}px`);
		return {
			legend: legend,
			colors: [],
			values: []
		};
	}

	// raster layer except maplibre hillshade
	const metadata: RasterTileMetadata = geohubLayer.info as RasterTileMetadata;
	const isRgbTile = isRgbRaster(metadata.colorinterp as string[]);

	const sourceUrl = (source.tiles ? source.tiles[0] : source.url) as string;
	const url = new URL(sourceUrl);

	const algorithmId = url.searchParams.get('algorithm');
	const colormap_name = url.searchParams.get('colormap_name');
	const colormapString = url.searchParams.get('colormap');
	const rescaleString = url.searchParams.get('rescale');

	let colors: [number, number, number, number][] = [];
	let values: string[] | number[][] = [];

	if (
		// non-true color raster without algorithm
		(!isRgbTile && !algorithmId) ||
		// raster with algorithm and customised colormap/colors
		(algorithmId && (colormap_name || colormapString))
	) {
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (metadata && metadata['band_metadata'][bandIndex]) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			bandMetaStats = metadata['band_metadata'][bandIndex][1] as BandMetadata;
		}

		creatorOption.unit = geohubLayer.dataset?.properties.tags?.find((t) => t.key === 'unit')
			?.value as string;

		const creator = new SvgLegendCreator();

		if (colormap_name) {
			// linear color legend
			creatorOption.min = bandMetaStats?.STATISTICS_MINIMUM;
			creatorOption.max = bandMetaStats?.STATISTICS_MAXIMUM;

			if (rescaleString) {
				const rescale: string[] = rescaleString.split(',');
				if (rescale.length === 2) {
					creatorOption.min = parseFloat(rescale[0]);
					creatorOption.max = parseFloat(rescale[1]);
				}
			}

			const isReverse = colormap_name.indexOf('_r') !== -1;
			let _c = chroma.scale(colormap_name.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
			if (isReverse) {
				_c = _c.reverse();
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			colors = _c.map((c) => c.hex('rgba'));
			legend = creator.generateLinearLegend(_c, creatorOption);
		} else if (colormap) {
			if (Array.isArray(colormap)) {
				// categorised numeric value legend
				values = colormap.map((c) => c[0]);
				colors = colormap.map((c) => c[1]) as [number, number, number, number][];
				legend = await creator.getCategorizedLegend(colors, values, creatorOption);
			} else {
				// unique value legend
				let uniqueValueColors: { [key: string]: string } = {};

				if (bandMetaStats) {
					uniqueValueColors = bandMetaStats['STATISTICS_UNIQUE_VALUES'] as {
						[key: string]: string;
					};
				}

				values = Object.keys(colormap).map((k) => {
					return uniqueValueColors[k] ?? k;
				}) as string[];
				colors = Object.values(colormap).map((c) => c) as [number, number, number, number][];

				legend = await creator.getUniqueValueLegend(colors, values);
			}
		}
	} else {
		// RGB legend or algorithm without colormap/colors

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

	return {
		legend,
		colors: colors,
		values: values,
		...creatorOption
	};
};

const getVectorPropertyNames = async (
	layer: VectorLayerSpecification,
	sprite: SpriteSpecification
) => {
	let colorProp = '';
	let shape = '';

	if (layer.type === 'fill') {
		colorProp = 'fill-color';
		const lineColor = layer.paint ? layer.paint['fill-outline-color'] : '{color}';
		shape = `<rect x='0' y='0' width='{size}' height='{size}' fill='{color}' stroke='${lineColor}' stroke-width='1' />`;
	} else if (layer.type === 'line') {
		colorProp = 'line-color';

		let lineWidth = layer.paint ? layer.paint['line-width'] : undefined;
		if (typeof lineWidth !== 'number') {
			lineWidth = 1;
		}
		shape = `<line x1='0' y1='{size}' x2='{size}' y2='0' stroke='{color}' stroke-width='${lineWidth}' />`;
	} else if (layer.type === 'fill-extrusion') {
		colorProp = 'fill-extrusion-color';
		shape = `<rect x='0' y='0' width='{size}' height='{size}' fill='{color}' stroke='{color}' stroke-width='1' />`;
	} else if (layer.type === 'circle') {
		colorProp = 'circle-color';
		const strokeColor = layer.paint ? layer.paint['circle-stroke-color'] : '{color}';
		const strokeWidth = layer.paint ? layer.paint['circle-stroke-width'] : '1';
		shape = `<circle cx='{size}' cy='{size}' r='{size}' fill='{color}' stroke='${strokeColor}' stroke-width='${strokeWidth}' />`;
	} else if (layer.type === 'heatmap') {
		colorProp = 'heatmap-color';
	} else if (layer.type === 'symbol') {
		colorProp = 'icon-color';
		const iconName = layer.layout ? (layer.layout['icon-image'] as string) : undefined;
		if (iconName) {
			if (typeof sprite === 'string') {
				const spriteBase = sprite.replace('/sprite/sprite', '/sprite-non-sdf/sprite');
				const data = `${spriteBase}@2x.png`;
				const spriteJson: { [key: string]: SpriteIcon } = (await fetchUrl(
					`${spriteBase}@2x.json`
				)) as unknown as { [key: string]: SpriteIcon };
				const spriteImage = spriteJson[iconName];
				if (spriteImage) {
					const image = await clipSprite(data, iconName, spriteImage);
					shape = image.src;
				}
			}
		}
	}

	return {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		colors: layer.paint ? layer.paint[colorProp] : undefined,
		shape: shape
	};
};

const getVectorLayerLegend = async (
	geohubLayer: Layer,
	vectorLayer: VectorLayerSpecification,
	sprite: SpriteSpecification,
	width: string
) => {
	const data = await getVectorPropertyNames(vectorLayer, sprite);

	const metadata: VectorTileMetadata = geohubLayer.info as VectorTileMetadata;
	const tilestats = metadata.json?.tilestats;
	const layerStats = tilestats?.layers.find((l) => l.layer === vectorLayer['source-layer']);

	let legend = '';

	data.colors = convertFunctionToExpression(data.colors, undefined);

	const creator = new SvgLegendCreator();

	const creatorOption: SvgLegendCreatorOptions = { width };
	const colors: [number, number, number, number][] = [];
	const values = [];

	if (Array.isArray(data.colors)) {
		// expression
		const exprType = data.colors[0];
		if (exprType === 'match') {
			creatorOption.unit = data.colors[1][1];
			creatorOption.shape = data.shape;
			const steps = data.colors.slice(2);

			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i + 1] ? steps[i + 1] : steps[i];
				let value = steps[i + 1] ? steps[i] : undefined;
				if (!value) {
					value = 'Others';
				}

				colors.push(color);
				values.push(value);
			}

			legend = await creator.getUniqueValueLegend(colors, values as string[], creatorOption);
		} else if (exprType === 'step') {
			creatorOption.unit = data.colors[1][1];
			const steps = data.colors.slice(2);

			const attrStats = layerStats?.attributes.find(
				(attr) => attr.attribute === creatorOption.unit
			);
			creatorOption.min = attrStats?.min;
			creatorOption.max = attrStats?.max;
			creatorOption.shape = data.shape;

			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i];
				const value = steps[i + 1];

				const ranges: number[] = [];
				if (i === 0) {
					if (creatorOption.min !== undefined) {
						const decimalPlaces = getDecimalPlaces(value);
						ranges.push(Number(creatorOption.min.toFixed(decimalPlaces)));
					}
					ranges.push(value);
				} else if (value === undefined) {
					ranges.push(steps[i - 1]);
					if (creatorOption.max) {
						const decimalPlaces = getDecimalPlaces(ranges[0]);
						ranges.push(Number(creatorOption.max.toFixed(decimalPlaces)));
					}
				} else {
					ranges.push(steps[i - 1]);
					ranges.push(value);
				}
				colors.push(color);
				values.push(ranges);
			}

			legend = await creator.getCategorizedLegend(colors, values as number[][], creatorOption);
		} else if (exprType === 'interpolate') {
			// heatmap
			creatorOption.unit = data.colors[2][0].replace(/-/g, ' ');
			creatorOption.shape = data.shape;
			const steps = data.colors.slice(4);
			for (let i = 0; i < steps.length; i += 2) {
				const color = steps[i];
				const value = i === 0 ? 0 : steps[i - 1];
				colors.push(color);
				values.push([value]);
			}
			legend = await creator.getCategorizedLegend(colors, values as number[][], creatorOption);
		}
	} else {
		// single color
		if (data.shape.startsWith('data:image') !== true) {
			creatorOption.shape = data.shape
				.replace('{color}', data.colors)
				.replace(/{size}/g, vectorLayer.type === 'circle' ? '15' : '30');
			if (creatorOption.shape.indexOf('{style}') !== -1) {
				const filter = `filter: ${hexToCSSFilter(chroma(data.colors).hex()).filter}`;
				creatorOption.shape = creatorOption.shape.replace('{style}', filter);
			}
		} else {
			const recolored = await recolorPngToSvg(data.shape, data.colors);
			creatorOption.shape = recolored.replace(
				/{size}/g,
				vectorLayer.type === 'circle' ? '15' : '30'
			);
		}

		legend = creator.getSVG(creatorOption.shape, 30);
	}

	return {
		legend,
		colors: colors,
		values: values,
		...creatorOption
	};
};
