<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { handleEnterKey } from '$lib/helper';
	import type { Tab } from '@undp-data/svelte-undp-design';
	export let tabs: Tab[];
	const dispatch = createEventDispatcher();
	export let activeTab: string;
</script>

<div class="tabs is-boxed p-0 mb-2 mt-2 is-justify-content-center">
	<ul>
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
</div>

<style lang="scss">
	.tabs {
		overflow-x: hidden;
		max-width: max-content;
	}
</style>
