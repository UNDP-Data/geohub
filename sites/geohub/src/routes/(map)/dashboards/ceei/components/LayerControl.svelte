<script lang="ts">
	import { Button } from '@undp-data/svelte-undp-design';
	import type { Layer } from '../stores';
	import { deleteLayer, duplicateLayer, toggleLayerVisibility } from '../utils/layerHelper';

	export let layerDetails: Layer;
	export let index: number;
</script>

<div class="a-card is-flex is-flex-direction-column is-gap-1">
	<div class="is-flex is-gap-1">
		<div class="is-flex-grow-1 text-heavy">{layerDetails.name}</div>
		<div class="is-flex is-align-items-center is-gap-1">
			<button class="button menu-button px-0 py-0" on:click={() => toggleLayerVisibility(index)}>
				<i class="fa fa-eye" />
			</button>
			<button class="button menu-button px-0 py-0">
				<i class="fa fa-sliders" />
			</button>
			<div class="dropdown is-hoverable is-right">
				<div class="dropdown-trigger">
					<button class="button menu-button px-0 py-0">
						<i class="fa fa-ellipsis" />
					</button>
				</div>
				<div class="dropdown-menu">
					<div class="dropdown-content">
						<!-- svelte-ignore a11y-missing-attribute -->
						<a role="button" tabindex="0" class="dropdown-item">Information</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a role="button" tabindex="0" class="dropdown-item">Zoom to layer</a>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="button"
							tabindex="0"
							on:click={() => duplicateLayer(index)}
							class="dropdown-item">Duplicate layer</a
						>
						<!-- svelte-ignore a11y-missing-attribute -->
						{#if index !== 0}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<a
								role="button"
								tabindex="0"
								class="dropdown-item"
								on:click={() => deleteLayer(index)}>Delete layer</a
							>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="is-background-light p-3 is-flex is-flex-direction-column is-gap-1">
		<div class="text-heavy">CEEI</div>
		<div class="bar"></div>
		<div class="is-flex light-text">
			<div class="is-flex-grow-1">0%</div>
			<div>100%</div>
		</div>
	</div>
	<Button title="CUSTOMIZE DATA" isPrimary={false}></Button>
	<Button title="SIMULATE" isPrimary={false}></Button>
</div>

<style lang="scss">
	.a-card {
		border: 1px solid #d4d6d8;
		padding: 16px;
		font-style: 'ProximaNova';
	}

	.bar {
		height: 24px;
		background: linear-gradient(90deg, #c598ff, #006eb5);
	}

	.text-heavy {
		font-weight: 700;
	}

	.menu-button {
		border: none;
		background: transparent;
		cursor: pointer;
		box-shadow: none;
	}
</style>
