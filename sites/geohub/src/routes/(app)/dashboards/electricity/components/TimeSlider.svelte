<script lang="ts" module>
	export const UNDP_DASHBOARD_RASTER_LAYER_ID = 'dashboard-electricity-raster-layer-{year}';
	export const UNDP_DASHBOARD_RASTER_SOURCE_ID = 'dashboard-electricity-raster-source-{year}';
</script>

<script lang="ts">
	import { page } from '$app/state';
	import type { RasterLayerSpecification, SourceSpecification } from 'maplibre-gl';
	import { hrea, map } from '../stores';
	import { reloadAdmin, setAdminUrl, setTargetTear } from '../utils/adminLayer';

	const adminUrl = page.data.adminUrl;

	setAdminUrl(adminUrl);

	import { getBase64EncodedUrl } from '$lib/helper';
	import { Slider } from '@undp-data/svelte-undp-components';
	import { getContext, onMount } from 'svelte';
	import {
		ELECTRICITY_DATATYPE_CONTEXT_KEY,
		type ElectricityDataTypeStore
	} from '../stores/electricityDataType';
	interface Props {
		scaleColorList?: string[];
		rasterColorMapName?: string;
		electricitySelected: string;
		loadAdminLabels?: boolean | undefined;
		newColorExpression?: string;
		isActive?: boolean;
	}

	let {
		scaleColorList = $bindable([]),
		rasterColorMapName = $bindable(''),
		electricitySelected = $bindable(),
		loadAdminLabels = $bindable(),
		newColorExpression = $bindable(),
		isActive = $bindable(false)
	}: Props = $props();

	const titilerUrl = page.data.titilerUrl;

	const electricityDataType: ElectricityDataTypeStore = getContext(
		ELECTRICITY_DATATYPE_CONTEXT_KEY
	);

	let minValue = $state($electricityDataType[0]);
	let maxValue = $state($electricityDataType[1]);
	const getDefaultSliderValues = () => {
		return [minValue === 2012 ? maxValue : minValue];
	};

	let rangeSliderValues = $state(getDefaultSliderValues());

	const getHreaUrl = (y: number) => {
		const dataset = $hrea?.find((ds) => ds.year === y);
		const url: string = dataset?.url ?? '';
		return getBase64EncodedUrl(url);
	};

	export function loadLayer() {
		if (!$map) return;
		if (!isActive) return;
		const yearValue = rangeSliderValues[0];
		setTargetTear(yearValue);
		let url = getHreaUrl(yearValue);
		invisibleRasterLayer();

		if (electricitySelected !== 'NONE') {
			loadRasterLayer(url, `${yearValue}`);
		}
		reloadAdmin(scaleColorList, loadAdminLabels, newColorExpression);
	}

	const invisibleRasterLayer = () => {
		const style = $map.getStyle();
		for (const layer of style.layers) {
			const exists = layer.id.startsWith(UNDP_DASHBOARD_RASTER_LAYER_ID.replace('{year}', ''));
			if (exists) {
				$map.setLayoutProperty(layer.id, 'visibility', 'none');
			}
		}
	};

	const loadRasterLayer = async (url: string, year: string) => {
		if (!$map) return;
		if (!url) return;

		const layerId = UNDP_DASHBOARD_RASTER_LAYER_ID.replace('{year}', year);
		const sourceId = UNDP_DASHBOARD_RASTER_SOURCE_ID.replace('{year}', year);

		if ($map.getLayer(UNDP_DASHBOARD_RASTER_LAYER_ID)) {
			$map.setLayoutProperty(layerId, 'visibility', 'visible');
		} else {
			const res = await fetch(`${titilerUrl}/statistics?url=${url}&unscale=1`);
			const layerInfo = await res.json();
			if (!(layerInfo && Object.keys(layerInfo).length > 0)) {
				return;
			}
			const bandInfo = layerInfo[Object.keys(layerInfo)[0]];
			const layerBandMetadataMin = bandInfo.min;
			const layerBandMetadataMax = bandInfo.max;
			const apiUrlParams = new URLSearchParams();
			apiUrlParams.set('scale', '1');
			apiUrlParams.set('TileMatrixSetId', 'WebMercatorQuad');
			apiUrlParams.set('url', url);
			apiUrlParams.set('bidx', '1');
			apiUrlParams.set('unscale', 'true');
			apiUrlParams.set('resampling', 'nearest');
			apiUrlParams.set('return_mask', 'true');
			if (electricitySelected == 'HREA') {
				// checking if minValue is 2012 then set the expression to 0.8 else 0.6
				// minValue being 2012 means the user selected Electricity estimate
				// minValue being 2021 means the user selected Electricity Forecast
				minValue === 2012
					? apiUrlParams.set('expression', `where(b1<0.8,0,1);`)
					: apiUrlParams.set('expression', `where(b1<0.6,0,1);`);
				apiUrlParams.set('colormap', '{"0":[12, 12, 12,255],"1":[242, 166, 4,255]}');
			}
			if (electricitySelected == 'ML') {
				apiUrlParams.set('rescale', `${layerBandMetadataMin},${layerBandMetadataMax}`);
				apiUrlParams.set('colormap_name', rasterColorMapName || 'gnbu');
			}

			const layerSource: SourceSpecification = {
				type: 'raster',
				tiles: [`${titilerUrl}/tiles/WebMercatorQuad/{z}/{x}/{y}.png?${apiUrlParams.toString()}`],
				tileSize: 256,
				// bounds: layerInfo['bounds'],
				attribution:
					'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
                Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
			};

			const layerDefinition: RasterLayerSpecification = {
				id: layerId,
				type: 'raster',
				source: sourceId,
				minzoom: 0,
				maxzoom: 22,
				layout: { visibility: 'visible' }
			};

			let firstSymbolId = undefined;
			for (const layer of $map.getStyle().layers) {
				if (layer.type === 'symbol') {
					firstSymbolId = layer.id;
					break;
				}
			}

			if (!$map.getSource(sourceId)) {
				$map.addSource(sourceId, layerSource);
			}
			if (!$map.getLayer(layerDefinition.id)) {
				$map.addLayer(layerDefinition, firstSymbolId);
			} else {
				$map.setLayoutProperty(layerDefinition.id, 'visibility', 'visible');
			}
		}
	};

	onMount(() => {
		electricityDataType.subscribe((value) => {
			minValue = value[0];
			maxValue = value[1];
			let defaultVal = minValue === 2012 ? maxValue : minValue;
			rangeSliderValues = [defaultVal];
			loadLayer();
		});
	});
	$effect(() => {
		loadLayer();
	});
</script>

<div class="slider pl-3 pb-4">
	<Slider
		bind:values={rangeSliderValues}
		bind:min={minValue}
		bind:max={maxValue}
		step={1}
		pips
		pipstep={1}
		first="label"
		last="label"
		rest="label"
		all={true}
	/>
</div>

<style lang="scss">
	.slider {
		width: 300px;
		border-radius: 4px;
		box-shadow: 2px 2px 2px 0 #7d7d7d;
		padding: 1em 0.5em;

		:global(.pipVal) {
			transform: rotate(-60deg) translateY(-12px) translateX(-15px);
		}
	}
</style>
