<script context="module" lang="ts">
	export interface SegmentButton {
		title: string;
		value: string | number;
		icon?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let buttons: SegmentButton[];
	export let selected: string | number | undefined = undefined;
	export let multiSelect = false;
	export let selectedItems: { [key: string | number]: boolean } = {};
	export let wrap = false;
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';

	const dispatch = createEventDispatcher();

	const handleSelected = (e: SegmentButton) => {
		if (multiSelect) {
			const value = e.value as string | number;
			selectedItems[value] = selectedItems[value] ? !selectedItems[value] : true;
			dispatch('change', {
				items: selectedItems,
				value: e.value
			});
		} else {
			selected = e.value;
			dispatch('change', {
				value: selected
			});
		}
	};
</script>

<div class="field has-addons is-flex {wrap ? 'is-flex-wrap-wrap' : ''}">
	{#each buttons as button}
		<p class="control">
			<button
				type="button"
				class="segment-button button is-{size} {(!multiSelect && selected === button.value) ||
				(multiSelect && selectedItems[button.value])
					? 'is-link is-active'
					: ''}"
				on:click={() => handleSelected(button)}
				disabled={button.disabled ?? false}
			>
				{#if button.icon}
					<span class="icon is-small">
						<i class={button.icon} />
					</span>
				{/if}
				<span>{button.title}</span>
			</button>
		</p>
	{/each}
</div>

<style lang="scss">
	.segment-button {
		min-width: 108px;
		height: 40px;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		border: 1px solid #000;
	}
</style>
