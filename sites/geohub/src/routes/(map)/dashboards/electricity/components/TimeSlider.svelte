<script lang="ts">
	import { page } from '$app/stores';
	import type { RasterLayerSpecification, SourceSpecification } from 'maplibre-gl';
	import { hrea, map, ml } from '../stores';
	import { reloadAdmin, setAzureUrl, setTargetTear } from '../utils/adminLayer';

	const azureUrl = $page.data.azureUrl;
	setAzureUrl(azureUrl);

	export let BEFORE_LAYER_ID: string;
	export let scaleColorList;
	export let electricitySelected: string;

	import { getBase64EncodedUrl } from '$lib/helper';
	import { Slider } from '@undp-data/svelte-undp-components';
	const UNDP_DASHBOARD_RASTER_LAYER_ID = 'dashboard-electricity-raster-layer';
	const UNDP_DASHBOARD_RASTER_SOURCE_ID = 'dashboard-electricity-raster-source';

	const titilerUrl = $page.data.titilerUrl;

	let minValue = 2012;
	let maxValue = 2020;
	let rangeSliderValues = [2020];

	$: electricitySelected, setSlider();
	$: rangeSliderValues, loadLayer();

	const setSlider = () => {
		switch (electricitySelected) {
			case 'HREA':
				minValue = 2012;
				maxValue = 2020;
				break;
			case 'ML':
				if (rangeSliderValues[0] > 2019) {
					rangeSliderValues[0] = 2019;
				}
				minValue = 2012;
				maxValue = 2019;
				break;
			case 'NONE':
				minValue = 2012;
				maxValue = 2020;
				break;
			default:
				break;
		}
		loadLayer();
	};

	const getHreaUrl = (y: number) => {
		const dataset = $hrea?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
	};

	const getMlUrl = (y: number) => {
		const dataset = $ml?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
	};

	export function loadLayer() {
		if (!$map) return;
		const yearValue = rangeSliderValues[0];
		setTargetTear(yearValue);
		let url = electricitySelected === 'HREA' ? getHreaUrl(yearValue) : getMlUrl(yearValue);
		if (electricitySelected === 'NONE') removeRasterLayer();
		else loadRasterLayer(url);
		reloadAdmin(scaleColorList);
	}

	const removeRasterLayer = () => {
		if ($map.getLayer(UNDP_DASHBOARD_RASTER_LAYER_ID))
			$map.removeLayer(UNDP_DASHBOARD_RASTER_LAYER_ID);
		if ($map.getSource(UNDP_DASHBOARD_RASTER_SOURCE_ID))
			$map.removeSource(UNDP_DASHBOARD_RASTER_SOURCE_ID);
	};

	const loadRasterLayer = async (url: string) => {
		if (!$map) return;
		const res = await fetch(`${titilerUrl}/info?url=${url}`);
		const layerInfo = await res.json();
		if (!(layerInfo && layerInfo['band_metadata'])) {
			return;
		}
		const layerBandMetadataMin = layerInfo['band_metadata'][0][1]['STATISTICS_MINIMUM'];
		const layerBandMetadataMax = layerInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM'];
		const apiUrlParams = new URLSearchParams();
		apiUrlParams.set('scale', '1');
		apiUrlParams.set('TileMatrixSetId', 'WebMercatorQuad');
		apiUrlParams.set('url', url);
		apiUrlParams.set('bidx', '1');
		apiUrlParams.set('unscale', 'false');
		apiUrlParams.set('resampling', 'nearest');
		apiUrlParams.set('return_mask', 'true');
		if (electricitySelected == 'HREA') {
			apiUrlParams.set('expression', `where(b1<0.8,0,1);`);
			apiUrlParams.set('colormap', '{"0":[12,12,12,255],"1":[242,166,4,255]}');
		}
		if (electricitySelected == 'ML') {
			apiUrlParams.set('rescale', `${layerBandMetadataMin},${layerBandMetadataMax}`);
			apiUrlParams.set('colormap_name', 'rdylbu');
		}

		const layerSource: SourceSpecification = {
			type: 'raster',
			tiles: [`${titilerUrl}/tiles/{z}/{x}/{y}.png?${apiUrlParams.toString()}`],
			tileSize: 256,
			bounds: layerInfo['bounds'],
			attribution:
				'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
                Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
		};

		const layerDefinition: RasterLayerSpecification = {
			id: UNDP_DASHBOARD_RASTER_LAYER_ID,
			type: 'raster',
			source: UNDP_DASHBOARD_RASTER_SOURCE_ID,
			minzoom: 0,
			maxzoom: 22,
			layout: { visibility: 'visible' }
		};

		let firstSymbolId = undefined;
		for (const layer of $map.getStyle().layers) {
			if (layer.type === 'symbol' || layer.id === BEFORE_LAYER_ID) {
				firstSymbolId = layer.id;
				break;
			}
		}

		if ($map.getLayer(UNDP_DASHBOARD_RASTER_LAYER_ID))
			$map.removeLayer(UNDP_DASHBOARD_RASTER_LAYER_ID);
		if ($map.getSource(UNDP_DASHBOARD_RASTER_SOURCE_ID))
			$map.removeSource(UNDP_DASHBOARD_RASTER_SOURCE_ID);

		$map.addSource(UNDP_DASHBOARD_RASTER_SOURCE_ID, layerSource);
		$map.addLayer(layerDefinition, firstSymbolId);
	};
</script>

<div class="slider">
	<Slider
		bind:values={rangeSliderValues}
		min={minValue}
		max={maxValue}
		step={1}
		pips
		pipstep={2}
		first="label"
		last="label"
		rest="label"
		all={true}
	/>
</div>
