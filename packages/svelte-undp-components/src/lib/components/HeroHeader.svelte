<script context="module" lang="ts">
	export interface HeroHeaderButton {
		title: string;
		href: string;
		tooltip: string;
	}
</script>

<script lang="ts">
	import Breadcrumbs, { type BreadcrumbPage } from './Breadcrumbs.svelte';
	import { initTooltipTippy } from '$lib/util/initTippy.js';
	import Tabs, { type Tab } from './Tabs.svelte';

	export let title: string;
	export let breadcrumbs: BreadcrumbPage[];
	export let tabs: Tab[] = [];
	export let activeTab = '';
	export let button: HeroHeaderButton = undefined;

	const tippyTooltip = initTooltipTippy();
</script>

<div class="has-background-light px-6 {tabs?.length > 0 ? 'pt-4' : 'py-4'}">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<div class="is-flex mt-6 mb-5">
		<p class="title is-3">{title}</p>

		{#if button}
			<div class="ml-auto hidden-mobile">
				<a
					class="button is-primary is-uppercase has-text-weight-bold"
					href={button.href}
					use:tippyTooltip={{ content: button.tooltip }}
				>
					{button.title}
				</a>
			</div>
		{/if}
	</div>

	{#if tabs?.length > 0}
		<Tabs
			bind:tabs
			bind:activeTab
			fontWeight="bold"
			isBoxed={false}
			isFullwidth={false}
			isCentered={false}
			isUppercase={true}
		/>
	{/if}
</div>
