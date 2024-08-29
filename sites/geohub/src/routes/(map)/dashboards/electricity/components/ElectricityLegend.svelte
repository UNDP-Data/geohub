<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let electricitySelected: string;

	let colorMapNameStore: string = 'pubu';

	const colorPickerChangeHandler = (e) => {
		colorMapNameStore = e.detail.colorMapName;
		dispatch('onRasterColorMapChange', {
			rasterColorMapName: colorMapNameStore
		});
	};
</script>

{#if electricitySelected == 'ML'}
	<!-- eslint-disable svelte/no-object-in-text-mustaches -->
	<div class="p-4 has-background-light">
		<p class="mb-2">Electricity access</p>
		<ColorMapPicker colorMapName={colorMapNameStore} on:change={colorPickerChangeHandler} />
	</div>
{/if}

{#if electricitySelected == 'HREA'}
	<div class="is-flex is-flex-direction-column mt-2" style="background-color: #F7F7F7">
		<div class="is-flex is-align-items-center p-2 border-bottom">
			<div class="legend without_electricity" />
			&nbsp;-&nbsp;<span class="is-capitalized">without electricity</span>
		</div>
		<div class="is-flex is-align-items-center p-2">
			<div class="legend electrified" />
			&nbsp;-&nbsp;<span class="is-capitalized">electrified</span>
		</div>
	</div>
{/if}

<style lang="scss">
	.border-bottom {
		border-bottom: 1px solid #d4d6d8;
	}

	.legend {
		height: 20px;
		width: 20px;

		&.without_electricity {
			background-color: rgb(12, 12, 12);
		}

		&.electrified {
			background-color: rgb(242, 166, 4);
		}
	}
</style>
