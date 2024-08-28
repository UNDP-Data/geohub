<script context="module" lang="ts">
	export interface HeroHeaderButton {
		title: string;
		href: string;
		tooltip: string;
	}

	export interface HeroHeaderSubButton {
		title: string;
		href: string;
		tooltip: string;
		callback?: (button: HeroHeaderSubButton) => void;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';

	import { initTooltipTippy } from '$lib/util/initTippy.js';
	import Breadcrumbs, { type BreadcrumbPage } from './Breadcrumbs.svelte';
	import Tabs, { type Tab } from './Tabs.svelte';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let icon = '';
	export let breadcrumbs: BreadcrumbPage[];
	export let tabs: Tab[] = [];
	export let activeTab = '';
	export let button: HeroHeaderButton | undefined = undefined;
	export let subButtons: HeroHeaderSubButton[] | undefined = undefined;

	let isButtonHovered = false;

	const tippyTooltip = initTooltipTippy();

	const handleBreadcrumbClicked = (e: { detail: BreadcrumbPage }) => {
		dispatch('breadcrumbClicked', e.detail);
	};

	const handleTabChange = () => {
		dispatch('tabChanged', {
			activeTab
		});
	};
</script>

<div class="has-background-light px-6 {tabs?.length > 0 ? 'pt-4' : 'py-4'}">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} on:click={handleBreadcrumbClicked} /></div>

	<div class="is-flex mt-6 mb-5">
		<h2 class="title is-2 is-uppercase">
			{#if icon}
				<i class="{icon} p-1 pr-2" />
			{/if}
			{title}
		</h2>

		{#if button}
			<div class="ml-auto hidden-mobile">
				{#if subButtons && subButtons.length > 0}
					<div
						role="menu"
						tabindex="-1"
						class="dropdown is-right {isButtonHovered ? 'is-active' : ''}"
						on:mouseleave={() => (isButtonHovered = false)}
					>
						<div class="dropdown-trigger">
							<a
								class="button is-primary is-uppercase has-text-weight-bold"
								aria-haspopup="true"
								aria-controls="hero-header-dropdown-menu"
								href={button.href}
								use:tippyTooltip={{ content: button.tooltip }}
								on:mouseenter={() => (isButtonHovered = true)}
							>
								<span>{button.title}</span>
								<span class="icon is-small">
									<i class="fas fa-angle-down" aria-hidden="true"></i>
								</span>
							</a>
						</div>
						<div
							tabindex="-1"
							class="dropdown-menu"
							id="hero-header-dropdown-menu"
							role="menu"
							on:mouseleave={() => (isButtonHovered = false)}
						>
							<div class="dropdown-content">
								{#each subButtons as btn}
									{#if btn.callback}
										<!-- svelte-ignore a11y-missing-attribute -->
										<a
											class="dropdown-item"
											role="menuitem"
											tabindex="0"
											use:tippyTooltip={{ content: btn.tooltip }}
											on:click={() => {
												if (btn.callback) {
													btn.callback(btn);
												}
											}}
											on:keydown={handleEnterKey}
										>
											{btn.title}
										</a>
									{:else}
										<a
											href={btn.href}
											class="dropdown-item"
											use:tippyTooltip={{ content: btn.tooltip }}
										>
											{btn.title}
										</a>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<a
						class="button is-primary is-uppercase has-text-weight-bold"
						href={button.href}
						use:tippyTooltip={{ content: button.tooltip }}
					>
						{button.title}
					</a>
				{/if}
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
			on:tabChange={handleTabChange}
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
