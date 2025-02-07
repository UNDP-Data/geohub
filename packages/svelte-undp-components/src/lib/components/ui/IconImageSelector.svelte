<script module lang="ts">
	export interface IconImageType {
		src: string;
		alt: string;
	}
</script>

<script lang="ts">
	import { clean } from '$lib/util/clean';
	import { initTippy } from '$lib/util/initTippy';
	import { onMount } from 'svelte';
	import IconImagePicker from './IconImagePicker.svelte';

	const tippy = initTippy({
		appendTo: document.body
	});
	let tooltipContent: HTMLElement | undefined = $state();

	interface Props {
		selected: string;
		images?: IconImageType[];
		readonly?: boolean;
		onselect?: (selected: IconImageType) => void;
	}

	let {
		selected = $bindable(),
		images = $bindable([]),
		readonly = $bindable(false),
		onselect = () => {}
	}: Props = $props();

	let showDialog = false;
	let iconImage = $state('');

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

	const handleSelect = (alt: string) => {
		selected = alt;
		iconImage = getIconImageSrc(selected) as string;
		const icon = images.find((img) => img.alt === selected);
		if (onselect) onselect(icon as IconImageType);
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
		<IconImagePicker bind:images onselect={handleSelect} onclose={handleClose} bind:selected />
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
