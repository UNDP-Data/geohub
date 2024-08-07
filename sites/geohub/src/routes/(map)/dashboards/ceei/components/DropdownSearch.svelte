<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from 'svelte-use-click-outside';

	interface Item {
		label: string;
		value: string;
	}

	const dispatch = createEventDispatcher();

	export let items: Item[];
	export let selectedItem = null;

	let showResults = false;
	let inputValue = '';
	$: filteredItemResults = items.filter((i) =>
		i.label.toLowerCase().includes(inputValue.toLowerCase())
	);

	const handleItemClick = (item: Item) => {
		selectedItem = item;
		inputValue = item.label;
		showResults = false;
		dispatch('select', item);
	};

	const handleClear = () => {
		inputValue = '';
		selectedItem = null;
		dispatch('select', null);
	};
</script>

<div class="dropdown is-fullwidth" class:is-active={showResults}>
	<div class="dropdown-trigger is-fullwidth">
		<div class="control has-icons-left has-icons-right">
			<input
				class="input"
				type="text"
				placeholder="Select a country..."
				use:clickOutside={() => (showResults = false)}
				bind:value={inputValue}
				on:focusin={() => (showResults = true)}
			/>
			<div class="icon is-small is-left">
				<i class="fa fa-search"></i>
			</div>
			<button
				class="icon is-small is-right"
				style="pointer-events: all; cursor: pointer"
				on:click={handleClear}
			>
				<i class="fa-solid fa-xmark"></i>
			</button>
		</div>
	</div>
	<div class="dropdown-menu" id="dropdown-menu" role="menu">
		<div class="dropdown-content">
			<hr class="dropdown-divider" />
			<div class="search-results">
				{#each filteredItemResults.length ? filteredItemResults : items as item}
					<button
						class="dropdown-item"
						class:is-active={selectedItem?.value === item.value}
						on:click={() => handleItemClick(item)}
					>
						{item.label}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	input {
		border: 1px solid #d4d6d8;
	}

	.search-results {
		max-height: 500px;
		overflow-y: scroll;
	}

	.dropdown,
	.dropdown-trigger,
	.dropdown-menu,
	.dropdown-content {
		width: 100%;
	}
</style>
