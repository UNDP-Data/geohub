<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let totalPages = 1;
	export let currentPage = 1;

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
</script>

<nav class="pagination" aria-label="Pagination">
	<ul>
		<!-- svelte-ignore a11y-role-supports-aria-props -->
		<li
			class={currentPage === 1 ? 'disabled' : ''}
			aria-disabled={currentPage === 1 ? 'true' : 'false'}
		>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				role="button"
				tabindex="0"
				aria-current="true"
				aria-label="Previous"
				data-testid="previous"
				on:click={() => handleClicked('previous')}
			>
				Previous
			</a>
		</li>
		<li>
			Page
			<!-- svelte-ignore a11y-missing-attribute -->
			<span><a aria-label={currentPage.toString()}>{currentPage}</a></span>
			of
			<!-- svelte-ignore a11y-missing-attribute -->
			<span><a aria-label={totalPages.toString()}>{totalPages}</a></span>
		</li>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-role-supports-aria-props -->
		<li
			class={currentPage === totalPages ? 'disabled' : ''}
			aria-disabled={currentPage === totalPages ? 'true' : 'false'}
		>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				role="button"
				tabindex="0"
				aria-label="Next"
				data-testid="next"
				on:click={() => handleClicked('next')}>Next</a
			>
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
