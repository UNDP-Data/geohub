<script lang="ts">
	import type { Tab } from '$lib/interfaces';

	interface Props {
		tabs: Tab[];
		activeTab: string | undefined;
		height?: number;
		fontSize?: 'medium' | 'large' | 'small';
		isToggleTab?: boolean;
	}

	let {
		tabs,
		activeTab = $bindable(),
		height = $bindable(0),
		fontSize = 'medium',
		isToggleTab = false
	}: Props = $props();

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowLeft') {
			setLeftActiveTab(activeTab);
		}
		if (event.key === 'ArrowRight') {
			setRightActiveTab(activeTab);
		}
	};
	const setLeftActiveTab = (currentActiveTab: string | undefined) => {
		const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab);
		const nextTabIndex = currentTabIndex - 1;
		if (nextTabIndex < 0) {
			activeTab = tabs[tabs.length - 1].label;
			document.getElementById(`tab-${activeTab}`)?.focus();
		} else {
			activeTab = tabs[nextTabIndex].label;
			document.getElementById(`tab-${activeTab}`)?.focus();
		}
	};
	const setRightActiveTab = (currentActiveTab: string | undefined) => {
		const currentTabIndex = tabs.findIndex((tab) => tab.label === currentActiveTab);
		const nextTabIndex = currentTabIndex + 1;
		const nextTab = tabs[nextTabIndex];
		if (nextTab) {
			activeTab = nextTab.label;
			document.getElementById(`tab-${activeTab}`)?.focus();
		} else {
			activeTab = tabs[0].label;
			document.getElementById(`tab-${activeTab}`)?.focus();
		}
	};
</script>

<div class="tabs-undp inviewport" data-viewport="true" bind:clientHeight={height}>
	<ul
		style="padding-left: 0;  text-align: center;"
		data-deep-link="true"
		data-tabs="true"
		id="tablist_1"
		role="tablist"
	>
		{#each tabs as tab (tab.id)}
			<li
				class="tab-{tab.label} tabs-title {`${
					activeTab && activeTab === tab.label ? 'is-active' : ''
				}`} px-1"
				role="presentation"
			>
				<!-- svelte-ignore a11y_missing_attribute -->
				<a
					aria-selected="true"
					role="tab"
					aria-controls="tab-{tab.label}"
					id="tab-{tab.label}"
					tabindex={Number(`${activeTab && activeTab === tab.label ? '0' : '-1'}`)}
					onkeydown={handleKeyDown}
					onclick={() => {
						if (isToggleTab && activeTab === tab.label) {
							activeTab = undefined;
						} else {
							activeTab = tab.label;
						}
					}}
				>
					<span
						class="icon-text"
						style="font-size: {fontSize === 'small'
							? '0.75'
							: fontSize === 'large'
								? '1.2'
								: '1'}rem;"
					>
						{#if tab.icon}
							<span class="icon">
								<i class={tab.icon}></i>
							</span>
						{/if}
						<span>
							{#if tab.labelFunction}
								{tab.labelFunction(tab.label)}
							{:else}
								{tab.label}
							{/if}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/tab.min.css';

	.tabs-undp li {
		margin-right: auto !important;
		a {
			text-transform: capitalize;
		}
	}
</style>
