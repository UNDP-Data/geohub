<script lang="ts">
	import { page } from '$app/stores';
	import { getMapImageFromStyle } from '$lib/helper';
	import type { StoryMapChapterType, StoryMapConfig } from '$lib/types';
	import {
		layerTypes,
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		StoryMapChapter,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy, ModalNotification } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce, isEqual } from 'lodash-es';
	import { type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import {
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY,
		type ActiveStorymapChapterStore
	} from './StorymapChapterEdit.svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapterType;
	export let isActive = false;
	export let disabled = false;

	let isHovered = false;

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	const activeChapterStore: ActiveStorymapChapterStore = getContext(
		ACTIVE_STORYMAP_CHAPTER_CONTEXT_KEY
	);

	let template_id: StoryMapTemplate;

	const tippyTooltip = initTooltipTippy();

	let showDeleteDialog = false;

	let requireUpdate = false;

	let previousChapter: StoryMapChapter;

	onMount(async () => {
		updateMapStyle();

		activeChapterStore.subscribe(() => {
			if ($activeChapterStore?.id === chapter.id) {
				updateMapStyle();
			}
		});
		configStore.subscribe((data) => {
			template_id = (data as StoryMapConfig).template_id as StoryMapTemplate;
		});
	});

	const applyLayerEvent = async () => {
		let mapStyle: StyleSpecification;
		if (typeof chapter.style === 'string') {
			const res = await fetch(chapter.style);
			mapStyle = await res.json();
		} else {
			mapStyle = chapter.style;
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
		newStyle.bearing = chapter.location.bearing;
		newStyle.pitch = chapter.location.pitch;
		newStyle.zoom = chapter.location.zoom;
		newStyle.center = chapter.location.center;
		return newStyle;
	};

	const updateMapStyle = debounce(async () => {
		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;

		if (!previousChapter) {
			// store current map image's chapter for future updating
			previousChapter = JSON.parse(JSON.stringify(chapter));
		} else if (isEqual(JSON.stringify(previousChapter), JSON.stringify(chapter))) {
			// if chapter is not changed at all, skip updating
			return;
		}

		requireUpdate = !requireUpdate;
	}, 300);

	const getMapImage = async () => {
		const newStyle = await applyLayerEvent();
		const mapImageData = await getMapImageFromStyle(newStyle, 212, 124, $page.data.staticApiUrl);
		return mapImageData;
	};

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
	{#key requireUpdate}
		{#await getMapImage()}
			<div class="is-flex is-justify-content-center mt-6">
				<Loader size="small" />
			</div>
		{:then mapImageData}
			<img
				src={mapImageData}
				alt="map preview"
				loading="lazy"
				width={212}
				height={124}
				draggable={false}
			/>
			<div class="overlay">
				<StoryMapChapter
					bind:chapter
					bind:activeId={chapter.id}
					bind:template={template_id}
					size="small"
				/>
			</div>
		{/await}
	{/key}

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

		.overlay {
			position: absolute;

			bottom: 40px;
			left: 50%;
			transform: translateX(-50%);
			-webkit-transform: translateX(-50%);
			-ms-transform: translateX(-50%);

			:global(.center) {
				min-width: 100px !important;
				max-width: 150px !important;
				margin-left: 0 !important;
			}

			:global(.left) {
				min-width: 100px !important;
				width: 150px !important;
				margin-left: 0 !important;
			}

			:global(.right) {
				min-width: 100px !important;
				width: 150px !important;
				margin-left: 0 !important;
				margin-right: 0 !important;
			}

			:global(.full) {
				margin-left: 0 !important;
				width: 150px !important;
			}
		}
	}
</style>
