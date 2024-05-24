<script lang="ts">
	import type { Country } from '$lib/types';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';
	import chroma from 'chroma-js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let country: Country;
	export let isSelectable = true;
	export let isSelected = false;

	const handleSDGSelected = () => {
		if (!isSelectable) return;
		isSelected = !isSelected;
		dispatch('countrySelected', {
			country: country,
			isSelected: isSelected
		});
	};

	const deselect = () => {
		isSelected = false;
		dispatch('countrySelected', {
			country: country,
			isSelected: isSelected
		});
	};
</script>

<div
	data-testid="country-card-container"
	class="country-button card m-0 p-0 {isSelectable ? 'is-selectable' : ''}"
	role="button"
	tabindex="0"
	on:click={handleSDGSelected}
	on:keydown={handleEnterKey}
>
	<div class="card-content">
		<div class="media">
			<figure
				class={`country-flag image is-48x48 is-flex is-justify-content-center is-align-items-center`}
				data-testid="icon-figure"
			>
				{#if country.iso_2}
					<span class="fi fi-{country.iso_2.toLowerCase()}" />
				{:else}
					<i class="no-flag fa-solid fa-flag fa-2xl" style="color: {chroma.random().css()}" />
				{/if}
			</figure>
			{#if isSelectable && isSelected}
				<div class="is-size-8 selected" title="Country selected">
					<i class="fas fa-check" />
				</div>
			{/if}
			{#if !isSelectable}
				<button class="delete is-small close-button" on:click={deselect} />
			{/if}
		</div>
		<div class="content is-size-7 columns is-gapless">
			<p class="column">
				{country.country_name}
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	.country-button {
		position: relative;

		.card-content {
			padding: 5px;

			.media {
				margin: 0;

				.country-flag {
					width: fit-content;
					margin: auto;
				}

				.fi {
					width: 48px !important;
					line-height: 2em !important;
				}

				.no-flag {
					margin: 0 auto;
				}

				.close-button {
					position: absolute;
					right: 2px;
					top: 1.5px;
				}

				.selected {
					color: hsl(141, 53%, 53%);
					position: absolute;
					right: 2px;
					top: 1.5px;
				}
			}
		}

		.content {
			width: 70px;
			margin: auto;
		}
	}

	.is-selectable {
		cursor: pointer;
		border: 1px solid transparent;
	}
	.is-selectable:hover {
		padding: 0;
		border: 1px solid hsl(204, 86%, 53%);
	}
</style>
