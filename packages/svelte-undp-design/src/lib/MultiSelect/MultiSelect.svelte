<script lang="ts">
	import type { MultiSelectItem } from '$lib/interfaces';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let category: string;
	export let items: MultiSelectItem[];
	export let controlType: 'checkbox' | 'radio' = 'checkbox';
	export let isFixHeight = false;

	let isOpened = false;

	const handleChanged = (value: unknown) => {
		dispatch('change', {
			value: value,
			items: items
		});
	};
</script>

<div class="multi-select {isOpened ? 'open' : ''}" data-multi-select="">
	<button
		type="button"
		aria-label="Region"
		aria-expanded={isOpened}
		data-id="filter"
		on:click={() => {
			isOpened = !isOpened;
		}}>{category}</button
	>
	<ul
		data-type="region"
		role="listbox"
		aria-multiselectable="true"
		aria-hidden="true"
		class={isFixHeight ? 'fix-height' : ''}
	>
		{#each items as item}
			{#if item.children}
				<li
					role="option"
					class="has-submenu {item.checked ? 'open' : ''}"
					aria-selected={item.checked}
				>
					<button
						type="button"
						class="checkbox-item"
						on:click={() => {
							item.checked = !item.checked;
						}}>{item.label}</button
					>
					<ul role="listbox" class="sub-menu">
						{#each item.children as child}
							<li role="option" aria-selected={child.checked}>
								<div class="form-check">
									<label for={child.id}>{child.label}</label>
									{#if controlType === 'checkbox'}
										<input
											type="checkbox"
											id={child.id}
											name={item.id}
											value={child.value}
											bind:checked={child.checked}
											on:change={() => {
												handleChanged(child.value);
											}}
										/>
									{:else}
										<input
											type="radio"
											id={child.id}
											name={item.id}
											value={child.value}
											on:change={() => {
												handleChanged(child.value);
											}}
										/>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</li>
			{:else}
				<li role="option" aria-selected={item.checked}>
					<div class="form-check">
						<label for={item.id}>{item.label}</label>
						{#if controlType === 'checkbox'}
							<input
								type="checkbox"
								id={item.id}
								name="group"
								value={item.value}
								bind:checked={item.checked}
								on:change={() => {
									handleChanged(item.value);
								}}
							/>
						{:else}
							<input
								type="radio"
								id={item.id}
								name="group"
								value={item.value}
								on:change={() => {
									handleChanged(item.value);
								}}
							/>
						{/if}
					</div>
				</li>
			{/if}
		{/each}
	</ul>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/multi-select.min.css';
	@use '../css/checkbox.min.css';
	@use '../css/radio.min.css';
</style>
