<script lang="ts">
	import { page } from '$app/stores';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { StoryMapChapter } from '$lib/types';
	import { layerTypes } from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy, ModalNotification } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapter;
	export let isActive = false;
	export let disabled = false;

	let isHovered = false;

	const tippyTooltip = initTooltipTippy();

	let mapStyle: StyleSpecification;

	let showDeleteDialog = false;

	let mapImageData: string;

	onMount(async () => {
		updateMapStyle();
	});

	const applyLayerEvent = async () => {
		if (!mapStyle) {
			if (typeof chapter.style === 'string') {
				const res = await fetch(chapter.style);
				mapStyle = await res.json();
			} else {
				mapStyle = chapter.style;
			}
		}

		const newStyle: StyleSpecification = JSON.parse(JSON.stringify(mapStyle));
		chapter.onChapterEnter?.forEach((layer) => {
			const index = newStyle.layers.findIndex((l) => l.id === layer.layer);
			if (index === -1) return;
			const l = newStyle.layers[index];
			const props = layerTypes[l.type];
			if (!(props && props.length > 0)) return;
			props.forEach((prop) => {
				newStyle.layers[index].paint[prop] = layer.opacity;
			});
		});
		mapStyle.bearing = chapter.location.bearing;
		mapStyle.pitch = chapter.location.pitch;
		mapStyle.zoom = chapter.location.zoom;
		mapStyle.center = chapter.location.center;
		return newStyle;
	};

	$: chapter, updateMapStyle();
	const updateMapStyle = debounce(async () => {
		const newStyle = await applyLayerEvent();
		mapImageData = await getMapImageFromStyle(newStyle, 216, 128, $page.data.staticApiUrl);
	}, 300);

	const handleSettingClicked = () => {
		dispatch('edit', { chapter });
	};

	const handleDuplicateClicked = () => {
		dispatch('duplicate', { chapter });
	};

	const handleDeleteClicked = () => {
		dispatch('delete', { chapter });
	};

	const handleHiddenClicked = () => {
		chapter.hidden = !chapter.hidden;
		dispatch('change', { chapter });
	};
</script>

<div
	class="preview {isActive ? 'is-active' : ''} {!isActive && isHovered ? 'is-hover' : ''}"
	role="menuitem"
	tabindex="-1"
	on:mouseenter={() => {
		isHovered = true;
	}}
	on:mouseleave={() => {
		isHovered = false;
	}}
>
	{#if mapImageData}
		<img src={mapImageData} alt="map preview" loading="lazy" width={216} height={128} />
	{:else}
		<div class="is-flex is-justify-content-center mt-6">
			<Loader size="small" />
		</div>
	{/if}
	{#if isActive || isHovered}
		<div class="is-flex ope-buttons">
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleSettingClicked}
				{disabled}
				use:tippyTooltip={{ content: 'Change the setting of this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> settings </span>
			</button>
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleDuplicateClicked}
				{disabled}
				use:tippyTooltip={{ content: 'Duplicate this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> content_copy </span>
			</button>
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				on:click={handleHiddenClicked}
				{disabled}
				use:tippyTooltip={{ content: `${chapter.hidden ? 'Show this slide' : 'Hide this slide.'}` }}
			>
				<span class="material-symbols-outlined small-icon">
					{#if chapter.hidden}
						visibility_off
					{:else}
						visibility
					{/if}
				</span>
			</button>
		</div>
		<button
			class="delete-button ope-button is-flex is-align-items-center is-justify-content-center"
			on:click={() => {
				showDeleteDialog = true;
			}}
			{disabled}
			use:tippyTooltip={{ content: 'Delete this slide' }}
		>
			<span class="material-symbols-outlined small-icon"> delete </span>
		</button>
	{/if}
</div>

{#if showDeleteDialog}
	<div class="has-text-left">
		<ModalNotification
			title="Delete slide"
			message="Are you sure deleting this slide?"
			messageType="danger"
			continueText="delete"
			cancelText="cancel"
			bind:dialogOpen={showDeleteDialog}
			on:continue={handleDeleteClicked}
			on:cancel={() => {
				showDeleteDialog = false;
			}}
		/>
	</div>
{/if}

<style lang="scss">
	.preview {
		position: relative;
		width: 100%;
		height: 128px;

		&.is-active {
			border: 2px solid #4f95dd;
		}

		&.is-hover {
			border: 2px solid #55606e;
		}

		.ope-buttons {
			position: absolute;
			bottom: 4px;
			left: 8px;
			z-index: 10;
		}

		.delete-button {
			position: absolute;
			bottom: 4px;
			right: 8px;
			z-index: 10;
		}

		.ope-button {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background-color: white;
			border: none;
			color: #55606e;

			.small-icon {
				font-size: 16px !important;
			}

			&:hover {
				background-color: #f7f7f7;
				color: gray;
			}
		}
	}
</style>
