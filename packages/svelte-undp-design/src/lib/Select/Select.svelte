<script lang="ts">
	import type { SelectItem } from '$lib/interfaces';

	interface Props {
		placeholder: string;
		items: SelectItem[];
		selectedItem: SelectItem | undefined;
		onselect?: (item: SelectItem) => void;
	}

	let {
		placeholder,
		items = $bindable(),
		selectedItem = $bindable(),
		onselect = () => {}
	}: Props = $props();

	let isOpened = $state(false);

	const handleSelectItem = (item: SelectItem) => {
		selectedItem = item;
		isOpened = false;
		if (onselect) onselect(item);
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
		onclick={() => {
			isOpened = !isOpened;
		}}
	>
		{#if selectedItem !== undefined}
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
				onclick={() => {
					handleSelectItem(item);
				}}
				onkeydown={handleKeyDown}
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
