<script context="module" lang="ts">
	export interface Tab {
		id: string;
		label: string;
		icon?: string;
		counter?: number;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	export let isFullwidth = false;
	export let isBoxed = true;
	export let isCentered = true;
	export let size: 'is-small' | 'is-medium' | 'is-large' | 'is-normal' = 'is-normal';
	export let tabs: Tab[];
	export let isCapitalized = false;
	export let isUppercase = false;
	export let fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' = 'normal';
	const dispatch = createEventDispatcher();
	export let activeTab: string;
</script>

<div
	class="tabs {isCentered ? 'is-centered' : ''} {size} {isBoxed ? 'is-boxed' : null} {isFullwidth
		? 'is-fullwidth'
		: null} m-0 mt-2 mb-2 is-justify-content-center"
>
	<ul>
		{#each tabs as tab}
			<li class={activeTab === tab.id ? 'is-active' : 'inactive-tab'}>
				<a
					href={tab.id.startsWith('#') ? tab.id : ''}
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
							: ''}"
					>
						{tab.label}
						{#if tab.counter && tab.counter > 0}
							<span class="counter is-size-7">{tab.counter}</span>
						{/if}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.tabs {
		overflow-x: hidden;
		max-width: 100%;

		.counter {
			background-color: rgb(233, 231, 231);
			border: max(1px, 0.0625rem) solid rgb(233, 231, 231);
			border-radius: 2em;
			color: #1c1c1c;
			display: inline-block;
			font-weight: 500;
			line-height: calc(1.25rem - max(1px, 0.0625rem) * 2);
			min-width: var(--base-size-20, 1.25rem);
			padding: 0 6px;
			text-align: center;
		}
	}
</style>
