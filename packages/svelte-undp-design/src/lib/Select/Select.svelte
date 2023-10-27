<script lang="ts">
	import type { SelectItem } from '$lib/interfaces';
	import { createEventDispatcher } from 'svelte';

	const dispacth = createEventDispatcher();

	export let placeholder: string;
	export let items: SelectItem[];

	let selectedItem: SelectItem;
	let isOpened = false;

	const handleSelectItem = (item: SelectItem) => {
		selectedItem = item;
		isOpened = false;
		dispacth('selected', {
			item
		});
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			event.target.click();
		}
	};
</script>

<div class="select-box {isOpened ? 'expanded' : ''}" data-select="">
	<button
		type="button"
		aria-haspopup="listbox"
		aria-label="Select"
		data-select-open=""
		on:click={() => {
			isOpened = !isOpened;
		}}
	>
		{#if selectedItem}
			{selectedItem.label}
		{:else}
			{placeholder}
		{/if}
	</button>
	<ul class={isOpened ? 'active' : ''} role="listbox" data-select-options="">
		{#each items as item}
			<li
				role="option"
				tabindex="0"
				data-value={item.value}
				aria-selected={selectedItem === item ? true : false}
				on:click={() => {
					handleSelectItem(item);
				}}
				on:keydown={handleKeyDown}
			>
				<span>{item.label}</span>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/custom-select.min.css';
</style>
