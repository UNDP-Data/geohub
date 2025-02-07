<script lang="ts">
	import { onMount } from 'svelte';
	import Breadcrumbs, { type BreadcrumbPage } from './Breadcrumbs.svelte';
	import MenuButton, { type MenuButtonType, type MenuSubButtonType } from './MenuButton.svelte';
	import Tabs, { type Tab } from './Tabs.svelte';

	interface Props {
		title: string;
		icon?: string;
		breadcrumbs: BreadcrumbPage[];
		tabs?: Tab[];
		activeTab?: string;
		button?: MenuButtonType | undefined;
		subButtons?: MenuSubButtonType[] | undefined;
		onBreadcrumbClick?: (page: BreadcrumbPage) => void;
		onTabChange?: (tab: string) => void;
	}

	let {
		title = $bindable(),
		icon = '',
		breadcrumbs = $bindable(),
		tabs = $bindable(),
		activeTab = $bindable(''),
		button = $bindable(),
		subButtons = $bindable(),
		onBreadcrumbClick = () => {},
		onTabChange = () => {}
	}: Props = $props();

	onMount(() => {
		if (!tabs) {
			tabs = [];
		}
	});
</script>

<div class="has-background-light px-6 {tabs && tabs.length > 0 ? 'pt-4' : 'py-4'}">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} onclick={onBreadcrumbClick} /></div>

	<div class="is-flex mt-6 mb-5">
		<h2 class="title is-2 is-uppercase">
			{#if icon}
				<i class="{icon} p-1 pr-2"></i>
			{/if}
			{title}
		</h2>

		{#if button}
			<div class="ml-auto hidden-mobile">
				<MenuButton bind:button bind:subButtons color="primary" />
			</div>
		{/if}
	</div>

	{#if tabs && tabs.length > 0}
		<Tabs
			bind:tabs
			bind:activeTab
			fontWeight="bold"
			isBoxed={false}
			isFullwidth={false}
			isCentered={false}
			isUppercase={true}
			onchange={onTabChange}
		/>
	{/if}
</div>

<style lang="scss">
	h2 {
		&.title {
			&.is-2 {
				font-size: 2.813rem;
				font-weight: 700;
				font-family: SohneBreit, ProximaNova, sans-serif;
				letter-spacing: 0.06rem;
			}
		}
	}
</style>
