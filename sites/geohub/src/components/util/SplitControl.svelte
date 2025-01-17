<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '@undp-data/svelte-undp-components';
	import { Split } from '@watergis/svelte-splitter';
	import { debounce } from 'lodash-es';
	import { getContext, untrack } from 'svelte';

	const mapStore: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	interface Props {
		isMenuShown?: boolean;
		initialSidebarWidth?: number;
		minSidebarWidth?: string;
		minMapWidth?: string;
		height?: number;
		width?: number;
		sidebarOnLeft?: boolean;
		isHorizontal?: boolean;
		sidebar?: import('svelte').Snippet;
		map?: import('svelte').Snippet;
	}

	let {
		isMenuShown = $bindable(false),
		initialSidebarWidth = 380,
		minSidebarWidth = '300px',
		minMapWidth = '50%',
		height = 0,
		width = 0,
		sidebarOnLeft = true,
		isHorizontal = false,
		sidebar,
		map
	}: Props = $props();

	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let splitControl: Split | undefined = $state();
	let splitterSize = $state('0px');

	let minPrimaryWidth = $state(sidebarOnLeft ? minSidebarWidth : minMapWidth);
	let minSecondaryWidth = $state(sidebarOnLeft ? minMapWidth : minSidebarWidth);

	const resizeMap = () => {
		if (!$mapStore) return;
		$mapStore.triggerRepaint();
		$mapStore.resize();
	};

	const setSplitControl = () => {
		if (!splitControl) return;

		if (isMenuShown === true) {
			if (isMobile) {
				if (sidebarOnLeft) {
					splitControl.setPercent(100);
					minSecondaryWidth = '0px';
				} else {
					splitControl.setPercent(0);
					minPrimaryWidth = '0px';
				}
				splitterSize = '0px';
			} else {
				if (sidebarOnLeft) {
					minPrimaryWidth = minSidebarWidth;
					minSecondaryWidth = minMapWidth;
					const widthPecent = (initialSidebarWidth / innerWidth) * 100;
					splitControl.setPercent(widthPecent);
				} else {
					minSecondaryWidth = minSidebarWidth;
					minPrimaryWidth = minMapWidth;
					const widthPecent = ((innerWidth - initialSidebarWidth) / innerWidth) * 100;
					splitControl.setPercent(widthPecent);
				}

				splitterSize = '10px';
				splitControl;
			}
		} else {
			if (sidebarOnLeft) {
				minPrimaryWidth = '0px';
				splitControl.setPercent(0);
			} else {
				minSecondaryWidth = '0px';
				splitControl.setPercent(100);
			}
			splitterSize = '0px';
		}
		resizeMap();
	};

	const opened = () => {
		setSplitControl();
	};

	const splitterChanged = debounce(() => {
		resizeMap();
	}, 300);
	let isMobile = $derived(innerWidth < 768 ? true : false);
	$effect(() => {
		if (isMobile !== undefined) {
			untrack(() => {
				setSplitControl();
			});
		}
	});
	let menuHeight = $derived(height > 0 ? height : innerHeight);

	let menuWidth = $derived(width > 0 ? width : innerWidth);

	$effect(() => {
		if (isMenuShown !== undefined) {
			untrack(() => {
				opened();
			});
		}
	});
	$effect(() => {
		if (splitControl) {
			untrack(() => {
				opened();
			});
		}
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="split-container" style="height:{menuHeight}px;width:{menuWidth}px">
	<Split
		horizontal={isHorizontal}
		initialPrimarySize="0%"
		bind:minPrimarySize={minPrimaryWidth}
		bind:minSecondarySize={minSecondaryWidth}
		bind:splitterSize
		on:changed={splitterChanged}
		bind:this={splitControl}
	>
		{#snippet primary()}
			<div class="primary-content">
				{#if sidebarOnLeft}
					{@render sidebar?.()}
				{:else}
					{@render map?.()}
				{/if}
			</div>
		{/snippet}

		{#snippet secondary()}
			<div class="secondary-content">
				{#if sidebarOnLeft}
					{@render map?.()}
				{:else}
					{@render sidebar?.()}
				{/if}
			</div>
		{/snippet}
	</Split>
</div>

<style lang="scss">
	.split-container {
		.primary-content {
			position: relative;
			height: 100%;
		}

		.secondary-content {
			position: relative;
			height: 100%;
		}
	}
</style>
