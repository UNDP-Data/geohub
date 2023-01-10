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

<nav class="pagination" aria-label="Pagination" role="navigation">
	<ul>
		<li
			class={currentPage === 1 ? 'disabled' : ''}
			aria-disabled={currentPage === 1 ? 'true' : 'false'}
		>
			<a
				role="button"
				aria-current="true"
				aria-label="Previous"
				on:click={() => handleClicked('previous')}
			>
				Previous
			</a>
		</li>
		<li>
			Page
			<span><a aria-label={currentPage.toString()}>{currentPage}</a></span>
			of
			<span><a aria-label={totalPages.toString()}>{totalPages}</a></span>
		</li>
		<li
			class={currentPage === totalPages ? 'disabled' : ''}
			aria-disabled={currentPage === totalPages ? 'true' : 'false'}
		>
			<a aria-label="Next" on:click={() => handleClicked('next')}>Next</a>
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
