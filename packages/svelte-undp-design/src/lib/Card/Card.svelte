<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-without-image-without-emphasize--docs -->
<script lang="ts">
	import { marked } from 'marked';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let linkName = 'READ MORE';
	export let url = '#';
	export let tag = '';
	export let title: string;
	export let description: string;

	export let isEmphasize = false;
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue' = 'global';
	export let icon = '';

	const handleClicked = () => {
		dispatch('selected');
	};
</script>

<div
	class="content-card undp-card {isEmphasize ? 'card-emphasize' : ''} {accent === 'global'
		? ''
		: `accent-${accent}`} {tag || icon ? '' : 'hide-border-top'}"
>
	<a href={url} on:click={handleClicked}>
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
		<div class="content-caption">
			<h5 class="" data-viewport="false">
				{title}
			</h5>
			<p>
				<span class="description">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(description)}
				</span>
			</p>
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

	.description {
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
