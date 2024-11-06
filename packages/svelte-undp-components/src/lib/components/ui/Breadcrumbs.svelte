<script context="module" lang="ts">
	export interface BreadcrumbPage {
		/** Title of breadcrumbs */
		title: string;
		/**
		 * URL to be navigated.
		 * If URL is not provided, it will dispatch 'click' event.
		 * */
		url?: string;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/index.js';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 * An array of BreadcrumbPage objects to be shown as breadcrumbs.
	 * If `url` property is provided, it will be navigated to the web page linked.
	 * If `url` is not provided, it will dispatch a click event instead.
	 */
	export let pages: BreadcrumbPage[];
	/**
	 * Size of breadcrumbs
	 */
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'small';

	const handleClicked = (page: BreadcrumbPage) => {
		dispatch('click', page);
	};
</script>

<nav class="breadcrumb has-text-weight-bold is-uppercase is-{size}" aria-label="breadcrumbs">
	<ul>
		{#each pages as page, index}
			{#if index === pages.length - 1}
				<li class="is-active">
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						aria-current="page"
						data-sveltekit-preload-data="off"
						data-sveltekit-preload-code="off"
					>
						{page.title}
					</a>
				</li>
			{:else if page.url}
				<li>
					<a aria-current="page" href={page.url}>
						{page.title}
					</a>
				</li>
			{:else}
				<li>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a
						role="button"
						tabindex="-1"
						aria-current="page"
						data-sveltekit-preload-data="off"
						data-sveltekit-preload-code="off"
						on:click={() => {
							handleClicked(page);
						}}
						on:keydown={handleEnterKey}
					>
						{page.title}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</nav>
