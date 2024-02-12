<script context="module" lang="ts">
	export interface BreadcrumbPage {
		title: string;
		url: string;
	}
</script>

<script lang="ts">
	export let pages: BreadcrumbPage[];
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'small';
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
			{:else}
				<li>
					<a aria-current="page" href={page.url}>
						{page.title}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</nav>
