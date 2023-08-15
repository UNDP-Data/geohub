<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="main-section mb-4">
	{#if $page.data.session}
		<slot />
	{:else}
		<div class="container m-4">
			<p class="title is-4">403</p>
			<p class="subtitle is-5 has-text-justified pt-4">
				No permission to access this page. Please sign in.
			</p>
		</div>
	{/if}
</div>

<style lang="scss">
	.main-section {
		padding-top: 1rem;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}
</style>
