<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Radio } from '../interfaces';

	const dispatch = createEventDispatcher();

	export let radios: Radio[];
	export let groupName: string;
	export let value: string;
	export let isVertical = false;
	export let allowHtml = false;

	const handleRadioClicked = (val: string) => {
		value = val;
		dispatch('change');
	};
</script>

<div class="radio-buttons" style="flex-direction: {isVertical ? 'column' : 'row'};">
	{#each radios as radio}
		<label class="radio">
			<div class="vertical-align is-flex-row">
				<input
					type="radio"
					name={groupName}
					bind:group={value}
					value={radio.value}
					data-testid={`radio-${radio.value}`}
					on:click={() => {
						handleRadioClicked(radio.value);
					}}
				/>
				{#if allowHtml === true}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html radio.label}
				{:else}
					{radio.label}
				{/if}
			</div>
		</label>
	{/each}
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/radio.min.css';

	.radio-buttons {
		display: flex;

		.radio {
			cursor: pointer;
			margin-left: 0.2rem;
			margin-right: 0.2rem;
			margin-top: 0.1rem;
			margin-bottom: 0.1rem;
			width: 100%;

			.vertical-align input {
				vertical-align: middle;
			}

			.is-flex {
				display: flex;
				flex-direction: row;
			}
		}
	}
</style>
