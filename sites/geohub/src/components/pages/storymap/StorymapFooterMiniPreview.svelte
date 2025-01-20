<script lang="ts">
	import type { StoryMapConfig } from '$lib/types';
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		StoryMapFooter,
		type StoryMapConfigStore,
		type StoryMapTemplate
	} from '@undp-data/svelte-maplibre-storymap';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { getContext, onMount } from 'svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);
	let template_id: StoryMapTemplate = $state('light');

	interface Props {
		isActive?: boolean;
		disabled?: boolean;
		onedit?: () => void;
	}

	let {
		isActive = $bindable(false),
		disabled = $bindable(false),
		onedit = () => {}
	}: Props = $props();

	let isHovered = $state(false);

	const tippyTooltip = initTooltipTippy();

	onMount(async () => {
		updateMapStyle();
		configStore.subscribe(updateMapStyle);
	});

	const updateMapStyle = debounce(async () => {
		template_id = ($configStore as StoryMapConfig).template_id as StoryMapTemplate;
	}, 300);

	const handleSettingClicked = () => {
		if (onedit) onedit();
	};
</script>

<div
	class="preview {isActive ? 'is-active' : ''} {!isActive && isHovered ? 'is-hover' : ''}"
	role="menuitem"
	tabindex="-1"
	onmouseenter={() => {
		isHovered = true;
	}}
	onmouseleave={() => {
		isHovered = false;
	}}
>
	<div class="image-preview">
		{#key template_id}
			<StoryMapFooter bind:template={template_id} size="small" />
		{/key}
	</div>

	{#if isActive || isHovered}
		<div class="is-flex ope-buttons">
			<button
				class="ope-button mr-1 is-flex is-align-items-center is-justify-content-center"
				onclick={handleSettingClicked}
				{disabled}
				use:tippyTooltip={{ content: 'Change the setting of this slide' }}
			>
				<span class="material-symbols-outlined small-icon"> settings </span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.preview {
		position: relative;
		width: 100%;
		height: 128px;
		border: 2px solid #f7f7f7;

		&.is-active {
			border: 2px solid #4f95dd;
		}

		&.is-hover {
			border: 2px solid #55606e;
		}

		.ope-buttons {
			position: absolute;
			bottom: 6px;
			left: 6px;
			z-index: 10;
		}

		.ope-button {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			background-color: white;
			border: none;
			color: #55606e;
			box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.1);

			.small-icon {
				font-size: 16px !important;
			}

			&:hover {
				background-color: #f7f7f7;
				color: gray;
			}
		}

		.image-preview {
			position: absolute;
			top: 50%;
			// left: 50%;
			transform: translateY(-50%);
			-webkit-transform: translateY(-50%);
			-ms-transform: translateY(-50%);

			:global(.footer) {
				max-height: 100px !important;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 3;
			}
		}
	}
</style>
