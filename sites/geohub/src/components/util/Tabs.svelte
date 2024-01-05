<script lang="ts">
	import { handleEnterKey } from '$lib/helper';
	import type { Tab } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';

	export let isFullwidth = false;
	export let isBoxed = true;
	export let size: 'is-small' | 'is-medium' | 'is-large' | 'is-normal' = 'is-normal';
	export let tabs: Tab[];
	export let isCapitalized = false;
	export let isUppercase = false;
	export let fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' = 'normal';
	const dispatch = createEventDispatcher();
	export let activeTab: string;
</script>

<div
	class="tabs is-centered {size} {isBoxed ? 'is-boxed' : null} {isFullwidth
		? 'fullwidth'
		: null} m-0 mt-2 mb-2 is-justify-content-center"
>
	<ul>
		{#each tabs as tab}
			<li class={activeTab === tab.id ? 'is-active' : 'inactive-tab'}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					role="tab"
					class="tab-{tab.id.toLowerCase()}"
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
					<span
						class="has-text-weight-{fontWeight} {isCapitalized ? 'is-capitalized' : ''} {isUppercase
							? 'is-uppercase'
							: ''}">{tab.label}</span
					>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.tabs {
		overflow-x: hidden;
		max-width: 100%;
	}
</style>
