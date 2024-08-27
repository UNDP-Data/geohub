<script context="module" lang="ts">
	export interface SpriteImage {
		src: string;
		alt: string;
	}
</script>

<script lang="ts">
	import { clean } from '$lib/util/clean.js';
	import { initTippy } from '$lib/util/initTippy.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import IconImagePicker from './IconImagePicker.svelte';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement;

	export let selected: string;
	export let images: SpriteImage[] = [];
	export let readonly = false;

	const dispatch = createEventDispatcher();

	let showDialog = false;
	let iconImage = '';

	onMount(() => {
		iconImage = getIconImageSrc(selected) as string;
	});

	const getIconImageSrc = (image: string) => {
		if (!(image && typeof image === 'string')) {
			selected = '';
			return '';
		}

		if (image) {
			const icon = images.find((img) => img.alt === selected);
			if (icon) {
				selected = icon.alt;
				const iconImageStyle = `width: 24px; height: 24px; background-image: url('${icon.src}'); background-size: cover; background-repeat: no-repeat;`;
				return iconImageStyle;
			}
		}
		selected = '';
		return '';
	};

	const handleClose = () => {
		showDialog = !showDialog;
	};

	const handleSelect = (event: CustomEvent) => {
		selected = event.detail.alt;
		iconImage = getIconImageSrc(selected) as string;
		const icon = images.find((img) => img.alt === selected);
		dispatch('select', icon);
	};
</script>

<button
	class="button"
	type="button"
	use:tippy={{ content: !readonly ? tooltipContent : undefined }}
	disabled={readonly}
>
	{#if iconImage}
		<span class="icon is-small">
			<figure class={`image is-24x24`} data-testid="icon-figure">
				<div style={iconImage}></div>
			</figure>
		</span>
		<span>{clean(selected)}</span>
	{/if}
</button>

{#if !readonly}
	<div class="tooltip pb-2" data-testid="tooltip" bind:this={tooltipContent}>
		<IconImagePicker bind:images on:select={handleSelect} on:close={handleClose} bind:selected />
	</div>
{/if}

<style lang="scss">
	.icon-button {
		cursor: pointer;
		width: 65px;
	}

	.icon-button-readonly {
		width: 65px;
	}

	.tooltip {
		z-index: 10;
		width: 300px;
		height: 250px;
	}
</style>
