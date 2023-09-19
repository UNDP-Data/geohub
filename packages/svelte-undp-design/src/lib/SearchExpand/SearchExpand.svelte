<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let value = '';
	export let minSearchLength = 2;
	export let open = false;
	export let placeholder = 'type keywords to search';
	export let timeout = 500;

	let isExpanded = false;
	let textElement: HTMLInputElement;

	const debounce = (fn: (...args: unknown[]) => void, ms = timeout) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		return function (this: unknown, ...args: unknown[]) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn.apply(this, args), ms);
		};
	};

	const handleExpand = () => {
		if (open) {
			textElement.focus();
			return;
		}

		isExpanded = !isExpanded;

		if (isExpanded) {
			textElement.focus();
		}
	};

	const handleClear = () => {
		value = '';
	};

	const handleTextInput = debounce(() => {
		dispatch('change', {
			value
		});
	}, timeout);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleTextInput();
		}
	};
</script>

<div class="expand-search {open || isExpanded ? 'open' : ''}">
	<button class="expand-button" on:click={handleExpand}>
		<div class="search-icon" />
	</button>
	<input
		class="search-text"
		type="text"
		aria-label="expand-search"
		bind:value
		bind:this={textElement}
		{placeholder}
		on:input={handleTextInput}
		on:keydown={handleKeyDown}
	/>
	<button
		class="close-button {value.length >= minSearchLength ? 'show' : ''}"
		on:click={handleClear}
	>
		<div class="close-icon" />
	</button>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/search-expand.min.css';

	.expand-search {
		.search-text {
			background: #ffffff00;
		}

		.search-icon {
			background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>');
			background-repeat: no-repeat;
			width: 24px;
			height: 24px;
		}

		.close-icon {
			background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>');
			background-repeat: no-repeat;
			width: 24px;
			height: 24px;
		}
	}
</style>
