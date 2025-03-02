<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-with-image--with-image -->
<script lang="ts">
	import { Loader } from '$lib';
	import { once } from 'svelte/legacy';

	interface Props {
		linkName?: string;
		url?: string;
		tag: string;
		title: string;
		image: string;
		accent?: 'global' | 'yellow' | 'red' | 'green' | 'blue';
		icon?: string;
		width: number;
		height: number;
		onclick?: () => void;
	}

	let {
		linkName = 'READ MORE',
		url = '#',
		tag,
		title,
		image,
		accent = 'global',
		icon = '',
		width,
		height,
		onclick = () => {}
	}: Props = $props();

	let imageLoaded = $state(false);

	const handleClicked = (e: { preventDefault: () => void }) => {
		if (url) {
			e.preventDefault();
			return;
		}
		if (onclick) onclick();
	};
</script>

<div
	class="content-card {accent === 'global' ? '' : `accent-${accent}`} {tag || icon
		? ''
		: 'hide-border-top'}"
>
	<a href={url} onclick={once(handleClicked)}>
		{#if tag || icon}
			<h6 class="" data-viewport="false">
				{#if icon}
					<i class={icon}></i>
				{/if}
				{#if tag}
					{tag}
				{/if}
			</h6>
		{/if}
		<div class="image">
			<img
				src={image}
				alt={image}
				{width}
				{height}
				loading="lazy"
				onload={() => {
					imageLoaded = true;
				}}
				onerror={() => {
					imageLoaded = true;
				}}
			/>

			{#if !imageLoaded}
				<div class="image-loader">
					<Loader size="medium" />
				</div>
			{/if}
		</div>
		<div class="content-caption">
			<h5 class="title" data-viewport="false">
				{title}
			</h5>
			<span class="cta__link cta--space">
				{linkName}
				<i></i>
			</span>
		</div>
	</a>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/content-card.min.css';
	@use '../css/buttons.min.css';

	.image {
		position: relative;
		border: 1px solid gray;

		.image-loader {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}

	.title {
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.content-card {
		&.hide-border-top {
			border-top: 2px solid #00000000;
		}
	}
</style>
