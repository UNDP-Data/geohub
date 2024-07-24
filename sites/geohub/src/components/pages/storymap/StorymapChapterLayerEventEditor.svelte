<script lang="ts">
	import type { StoryMapChapterLayerEvent } from '@undp-data/svelte-maplibre-storymap';
	import { Loader } from '@undp-data/svelte-undp-design';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';

	export let style: string | StyleSpecification;
	export let chapterLayerEvent: StoryMapChapterLayerEvent[];

	let styleJson: StyleSpecification;

	onMount(() => {
		initialize();
	});

	const initialize = async () => {
		styleJson = await fetchStyle();
	};

	const fetchStyle = async () => {
		if (typeof style === 'string') {
			const res = await fetch(style);
			let json: StyleSpecification = await res.json();
			json = applyLayerEvent(json);
			return json;
		} else {
			style = applyLayerEvent(style);
			return style;
		}
	};

	const applyLayerEvent = (json: StyleSpecification) => {
		for (let i = 0; i < json.layers.length; i++) {
			const l = json.layers[i];
			const layerEvent = chapterLayerEvent?.find((e) => e.layer === l.id);
			if (layerEvent) {
				if (layerEvent.opacity === 0) {
					l.layout.visibility = 'none';
				} else {
					l.layout.visibility = 'visible';
				}
			}
		}
		return json;
	};

	const handleChangeLayerVisibility = (e) => {
		const layerId = e.target.id;
		const checked = e.target.checked;

		if (!chapterLayerEvent) {
			chapterLayerEvent = [];
		}

		const layerEvent: StoryMapChapterLayerEvent = {
			layer: layerId,
			opacity: checked ? 1 : 0,
			duration: 300
		};

		const index = chapterLayerEvent.findIndex((e) => e.layer === layerId);
		if (index === -1) {
			chapterLayerEvent = [...chapterLayerEvent, layerEvent];
		} else {
			chapterLayerEvent[index] = layerEvent;
			chapterLayerEvent = [...chapterLayerEvent];
		}
	};
</script>

{#if !styleJson}
	<div class="is-flex is-justify-content-center">
		<Loader size="small" />
	</div>
{:else}
	<nav class="panel layer-panel">
		{#each styleJson.layers as layer}
			{@const visibility = layer.layout?.visibility === 'none' ? false : true}
			<label class="panel-block">
				<input
					id={layer.id}
					type="checkbox"
					checked={visibility}
					on:change={handleChangeLayerVisibility}
				/>
				{layer.id}
			</label>
		{/each}
	</nav>
{/if}

<style lang="scss">
	.layer-panel {
		max-height: 300px;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
