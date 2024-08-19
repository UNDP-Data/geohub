import type { RequestHandler } from './$types';
import type {
	BandMetadata,
	DashboardMapStyle,
	Layer,
	RasterTileMetadata,
	VectorLayerSpecification
} from '$lib/types';
import { getActiveBandIndex, isRgbRaster } from '$lib/helper';
import { error } from '@sveltejs/kit';
import type {
	RasterLayerSpecification,
	RasterSourceSpecification,
	VectorSourceSpecification
} from 'maplibre-gl';
import chroma from 'chroma-js';

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
				: getVectorLayerLegend(
						geohubLayer,
						maplibreLayer,
						maplibreSource as VectorSourceSpecification
					);

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

		const unit = geohubLayer.dataset?.properties.tags?.find((t) => t.key === 'unit')?.value;

		if (colormap_name) {
			// linear color legend
			const min = bandMetaStats?.STATISTICS_MINIMUM;
			const max = bandMetaStats?.STATISTICS_MAXIMUM;

			const isReverse = colormap_name.indexOf('_r') !== -1;
			let colors = chroma.scale(colormap_name.replace('_r', '')).mode('lrgb').colors(5, 'rgba');
			if (isReverse) {
				colors = colors.reverse();
			}
			legend = `<svg width='100%' height='${unit ? 70 : 50}' xmlns='http://www.w3.org/2000/svg'>
  <defs>
  	<linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'>
			${colors.map((c, index) => {
				let offset = 100 / colors.length - 1;
				if (index > 0) {
					offset += (100 / colors.length - 1) * index;
				}
				return `<stop offset='${offset}%' style='stop-color:${c};stop-opacity:1' />`;
			})}
	</linearGradient>
  </defs>
  ${unit ? `<text x='0' y='15' font-family='ProximaNova' font-size='12' fill='#000000'>${unit}</text>` : ''}
  <rect y='20' width='100%' height='28' fill='url(#grad1)' />
    ${min ? `<text x='0' y='${unit ? 65 : 45}' font-family='ProximaNova' font-size='12' fill='#000000'>${min.toFixed(0)}</text>` : ''}
  	${max ? `<text x='100%' y='${unit ? 65 : 45}' font-family='ProximaNova' font-size='12' fill='#000000' text-anchor='end'>${max.toFixed(0)}</text>` : ''}
</svg>`;
		} else if (colormap) {
			let colors: string[];
			if (Array.isArray(colormap)) {
				// categorised numeric value legend
				const values: number[][] = colormap.map((c) => c[0]);
				colors = colormap.map((c) => chroma.rgb(c[1][0], c[1][1], c[1][2], c[1][3]).css());

				legend = `<svg width='100%' height='${30 * colors.length}' xmlns='http://www.w3.org/2000/svg'>
				${unit ? `<text x='10' y='15' font-family='ProximaNova' font-size='12' fill='#000000'>${unit}</text>` : ''}
			${colors
				.map((c, index) => {
					return `
				<rect x='10' y='${(unit ? 25 : 10) + 22 * index}' width='20' height='20' fill='${c}'/>
  				<text x='40' y='${(unit ? 40 : 25) + 22 * index}' font-family='ProximaNova' font-size='14'>${values[index].join(' - ')}</text>
				`;
				})
				.join('')}
</svg>`;
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
				}) as unknown as string[];
				colors = Object.values(colormap).map((c) => chroma.rgb(c[0], c[1], c[2], c[3]).css());

				legend = `<svg width='100%' height='${30 * colors.length}' xmlns='http://www.w3.org/2000/svg'>
			${colors
				.map((c, index) => {
					return `
				<rect x='10' y='${10 + 22 * index}' width='20' height='20' fill='${c}'/>
  				<text x='40' y='${25 + 22 * index}' font-family='ProximaNova' font-size='14'>${values[index]}</text>
				`;
				})
				.join('')}
</svg>`;
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

const getVectorLayerLegend = (
	geohubLayer: Layer,
	vectorLayer: VectorLayerSpecification,
	source: VectorSourceSpecification
) => {
	console.log(geohubLayer, vectorLayer, source);
	return '';
};
