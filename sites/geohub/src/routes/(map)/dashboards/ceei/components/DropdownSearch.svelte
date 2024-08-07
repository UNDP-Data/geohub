<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Item {
		label: string;
		value: string;
	}

	const dispatch = createEventDispatcher();

	export let items: Item[];
	export let selectedItem = items[0];

	let showResults = false;
	let inputValue = '';
	$: filterItems = inputValue && inputValue !== 'All';

	const handleDropdownToggle = () => {
		showResults = !showResults;
		if (showResults) {
			inputValue = selectedItem.label;
		}
	};

	const handleItemClick = (item: Item) => {
		selectedItem = item;
		inputValue = item.label;
		showResults = false;
		dispatch('select', item);
	};
</script>

<div class="dropdown is-fullwidth" class:is-active={showResults}>
	<div class="dropdown-trigger is-fullwidth">
		<button
			class="button is-fullwidth is-flex"
			aria-haspopup="true"
			aria-controls="dropdown-menu"
			on:click={handleDropdownToggle}
		>
			<span class="icon is-small">
				<i class="fas fa-search" aria-hidden="true"></i>
			</span>
			<span class="is-flex-grow-1 has-text-left"
				>{selectedItem.label || 'Filter by country...'}</span
			>
			<span class="icon is-small">
				<i class="fas fa-angle-down" aria-hidden="true"></i>
			</span>
		</button>
	</div>
	<div class="dropdown-menu" id="dropdown-menu" role="menu">
		<div class="dropdown-content">
			<div class="control has-icons-right">
				<input
					class="dropdown-item input"
					type="text"
					placeholder="Select a country..."
					bind:value={inputValue}
					on:focusin={() => (showResults = true)}
				/>
				<button
					class="icon is-small is-right"
					style="pointer-events: all; cursor: pointer"
					on:click={() => {
						inputValue = '';
					}}
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>

			<hr class="dropdown-divider" />
			<div class="search-results">
				{#each filterItems ? items.filter((i) => i.label
								.toLowerCase()
								.includes(inputValue.toLowerCase())) : items as item}
					<button
						class="dropdown-item"
						class:is-active={selectedItem.value === item.value}
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
		border: none;
	}

	.search-results {
		max-height: 500px;
		overflow-y: scroll;
	}

	.dropdown,
	.dropdown-trigger,
	.dropdown-menu,
	.dropdown-content,
	.button {
		width: 100%;
	}
</style>
