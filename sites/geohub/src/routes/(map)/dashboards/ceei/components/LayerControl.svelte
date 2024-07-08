<script lang="ts">
	import { ModalTemplate } from '@undp-data/svelte-undp-components';
	import { Button } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import type { Layer } from '../stores';
	import {
		deleteLayer,
		downloadData,
		duplicateLayer,
		toggleLayerVisibility,
		uploadData,
		zoomToLayer
	} from '../utils/layerHelper';

	export let layerDetails: Layer;
	export let index: number;

	let showCustomizeDataModal = false;
	const dispatch = createEventDispatcher();

	const simulate = () => {
		dispatch('simulate', {
			text: 'Simulate'
		});
	};
</script>

<div class="a-card is-flex is-flex-direction-column is-gap-1">
	<div class="is-flex is-gap-1">
		<div class="is-flex-grow-1 text-heavy">{layerDetails.name}</div>
		<div class="is-flex is-align-items-center is-gap-1">
			<button class="button menu-button px-0 py-0" on:click={() => toggleLayerVisibility(index)}>
				{#if layerDetails.isVisible}
					<i class="fa fa-eye" />
				{:else}
					<i class="fa fa-eye-slash" />
				{/if}
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
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<a role="button" tabindex="0" class="dropdown-item" on:click={() => zoomToLayer(index)}>
							Zoom to layer
						</a>
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
	<Button
		title="Customize Data"
		isPrimary={false}
		on:clicked={() => (showCustomizeDataModal = true)}
	></Button>
	<Button title="SIMULATE" isPrimary={false} on:clicked={simulate}></Button>
</div>

<ModalTemplate title="Customize data for {layerDetails.name}" bind:show={showCustomizeDataModal}>
	<div slot="content" class="is-flex is-flex-direction-column is-gap-2">
		<div class="is-background-light p-4 is-flex is-flex-direction-column is-gap-1">
			<p>Download {layerDetails.name} data as a .exc file to customise it on your device.</p>
			<Button
				title={layerDetails.isDataLoaded ? 'Download' : 'NOT READY FOR DOWNLOAD'}
				isPrimary={false}
				on:clicked={() => downloadData(index)}
			></Button>
		</div>
		<div class="is-background-light p-4 is-flex-direction-column is-gap-1">
			<p>Upload your adjusted .exc file.</p>
			<Button title="Upload" isPrimary={false} on:clicked={() => uploadData(index)}></Button>
		</div>
	</div>
</ModalTemplate>

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
