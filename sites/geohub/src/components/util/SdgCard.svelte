<script lang="ts">
	import { SdgLogos } from '$lib/config/AppConfig';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let sdg: number;
	export let isSelectable = true;
	export let isSelected = false;
	export let showDelete = false;
	export let size: 'small' | 'medium' = 'medium';

	const logo = SdgLogos.find((s) => s.value === sdg);

	const handleSDGSelected = () => {
		if (!isSelectable) return;
		isSelected = !isSelected;
		dispatch('sdgSelected', {
			sdg: sdg,
			isSelected: isSelected
		});
	};

	const handleSDGDeleted = () => {
		isSelected = false;
		dispatch('deleted', {
			sdg: sdg
		});
	};
</script>

<div
	class="sdg-button card m-0 p-0 {isSelectable ? 'is-selectable' : ''}"
	role="button"
	tabindex="0"
	on:click={handleSDGSelected}
	on:keydown={handleEnterKey}
>
	<div class="card-content">
		<div class="media">
			<figure
				class={`sdg image ${size === 'medium' ? 'is-48x48' : 'is-24x24'}`}
				data-testid="icon-figure"
			>
				<img src={logo.icon} alt="SDG {logo.value}" title="SDG {logo.value}" />
			</figure>
		</div>
		{#if isSelectable}
			<div class="content is-size-7 columns is-gapless">
				<p class="column is-10 is-align-content-center">
					SDG {logo.value}
				</p>
				{#if isSelected}
					<div class="column is-size-8 selected" title="Colormap Selected">
						<i class="fas fa-check" />
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if showDelete}
		<button
			class="delete-button delete {size === 'small' ? 'is-small' : ''}"
			on:click={() => handleSDGDeleted()}
		></button>
	{/if}
</div>

<style lang="scss">
	.sdg-button {
		position: relative;

		.card-content {
			padding: 5px;

			.media {
				margin: 0;
			}

			.selected {
				color: hsl(141, 53%, 53%);
				position: relative;
				right: 2px;
				top: 1.5px;
			}
		}

		.delete-button {
			position: absolute;
			top: -5px;
			right: -5px;
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
