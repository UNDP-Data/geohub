<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let totalPages = 1;
	export let currentPage = 1;
	export let hidden = false;

	const handleClicked = (type: 'previous' | 'next') => {
		if (type === 'previous') {
			if (currentPage === 1) return;
			currentPage--;
		} else {
			if (currentPage === totalPages) return;
			currentPage++;
		}
		dispatch('clicked', {
			type: type
		});
	};
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

<nav class="pagination" aria-label="Pagination" {hidden}>
	<ul>
		<!-- svelte-ignore a11y-role-supports-aria-props -->
		<li
			class={currentPage === 1 ? 'disabled' : ''}
			aria-disabled={currentPage === 1 ? 'true' : 'false'}
		>
			<div
				role="button"
				tabindex="0"
				aria-current="true"
				aria-label="Previous"
				data-testid="previous"
				on:click={() => handleClicked('previous')}
				on:keydown={handleKeyDown}
			>
				Previous
			</div>
		</li>
		<li>
			Page
			<span><div aria-label={currentPage.toString()}>{currentPage}</div></span>
			of
			<span><div aria-label={totalPages.toString()}>{totalPages}</div></span>
		</li>
		<!-- svelte-ignore a11y-role-supports-aria-props -->
		<li
			class={currentPage === totalPages ? 'disabled' : ''}
			aria-disabled={currentPage === totalPages ? 'true' : 'false'}
		>
			<div
				role="button"
				tabindex="0"
				aria-label="Next"
				data-testid="next"
				on:click={() => handleClicked('next')}
				on:keydown={handleKeyDown}
			>
				Next
			</div>
		</li>
	</ul>
</nav>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/pagination.min.css';

	.disabled {
		cursor: default !important;
	}
</style>
