<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { Tab } from '@undp-data/svelte-undp-design';
	export let tabs: Tab[];
	const dispatch = createEventDispatcher();
	export let activeTab: string;
</script>

<ul class="tabs is-fullwidth is-boxed px-3 mb-4 is-justify-content-center is-flex-wrap-wrap">
	{#each tabs as tab}
		<li class={activeTab === tab.id ? 'is-active' : 'inactive-tab'}>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				role="tab"
				tabindex="0"
				on:click={() => {
					activeTab = tab.id;
					dispatch('tabChange', activeTab);
				}}
				data-sveltekit-preload-data="off"
				data-sveltekit-preload-code="off"
				on:keydown={handleEnterKey}
			>
				{#if tab.icon}
					<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
				{/if}
				<span class="has-text-weight-bold">{tab.label}</span>
			</a>
		</li>
	{/each}
</ul>

<style lang="scss">
	.tabs {
		overflow-x: hidden;
	}
	.inactive-tab {
		border-bottom: 2px solid #f5f5f5; // similar to look of bulma tabs
	}
</style>
