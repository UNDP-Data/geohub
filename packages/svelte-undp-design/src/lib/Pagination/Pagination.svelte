<script lang="ts">
	interface Props {
		totalPages?: number;
		currentPage?: number;
		hidden?: boolean;
		onclick?: (type: 'previous' | 'next') => void;
	}

	let {
		totalPages = $bindable(1),
		currentPage = $bindable(1),
		hidden = false,
		onclick = () => {}
	}: Props = $props();

	const handleClicked = (type: 'previous' | 'next') => {
		if (type === 'previous') {
			if (currentPage === 1) return;
			currentPage--;
		} else {
			if (currentPage === totalPages) return;
			currentPage++;
		}
		if (onclick) onclick(type);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<nav class="pagination" aria-label="Pagination" {hidden}>
	<ul>
		<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
		<li
			class={currentPage === 1 ? 'disabled' : ''}
			aria-disabled={currentPage === 1 ? 'true' : 'false'}
		>
			<!-- svelte-ignore a11y_missing_attribute -->
			<a
				role="button"
				tabindex="0"
				aria-current="true"
				aria-label="Previous"
				data-testid="previous"
				onclick={() => handleClicked('previous')}
				onkeydown={handleKeyDown}
			>
				Previous
			</a>
		</li>
		<li>
			Page
			<span><div aria-label={currentPage.toString()}>{currentPage}</div></span>
			of
			<span><div aria-label={totalPages.toString()}>{totalPages}</div></span>
		</li>
		<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
		<li
			class={currentPage === totalPages ? 'disabled' : ''}
			aria-disabled={currentPage === totalPages ? 'true' : 'false'}
		>
			<!-- svelte-ignore a11y_missing_attribute -->
			<a
				role="button"
				tabindex="0"
				aria-label="Next"
				data-testid="next"
				onclick={() => handleClicked('next')}
				onkeydown={handleKeyDown}
			>
				Next
			</a>
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
