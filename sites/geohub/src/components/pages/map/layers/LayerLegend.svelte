<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import type { LegendLayer } from '$lib/server/helpers';
	import type { DashboardMapStyle, Layer } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const getLegend = async () => {
		const mapStyle = $map.getStyle();

		let layerIds = [layer.id];
		if (layer.children && layer.children.length > 0) {
			layerIds = [...layerIds, ...layer.children.map((l) => l.id)];
		}

		mapStyle.layers = mapStyle.layers.filter((l) => layerIds.includes(l.id));
		const sourceIds = mapStyle.layers.map((l) => {
			return 'source' in l ? l['source'] : undefined;
		});
		for (const name of Object.keys(mapStyle.sources)) {
			if (sourceIds.includes(name)) continue;
			delete mapStyle.sources[name];
		}

		const style: DashboardMapStyle = {
			id: layer.id,
			name: layer.name,
			createdat: new Date().toString(),
			updatedat: new Date().toString(),
			style: mapStyle,
			layers: [layer],
			access_level: AccessLevel.PRIVATE,
			created_user: 'api',
			updated_user: 'api',
			no_stars: 0,
			is_star: false,
			links: []
		};

		const res = await fetch(`/api/style/legend?width=328px`, {
			method: 'POST',
			body: JSON.stringify(style)
		});
		const json: LegendLayer[] = await res.json();
		return json[0];
	};

	let isLayerChanged = false;
	const updateLegend = debounce((e) => {
		if (e.layerId && layer.id !== e.layerId) return;
		isLayerChanged = !isLayerChanged;
	}, 300);

	onMount(() => {
		$map.on('styledata', updateLegend);
	});
</script>

{#await getLegend()}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:then legend}
	{#if legend.legend.startsWith('http') || legend.legend.startsWith('https')}
		<img src={legend.legend} alt={legend.name} />
	{:else}
		<div class="legend">
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html legend.legend}
		</div>
	{/if}
{/await}

<style lang="scss">
	.legend {
		max-height: 250px;
		overflow-y: auto;
	}
</style>
