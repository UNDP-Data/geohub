<script lang="ts">
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Split } from '@watergis/svelte-splitter';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	const mapStore: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let isMenuShown = false;
	export let initialSidebarWidth = 380;
	export let minSidebarWidth = '300px';
	export let minMapWidth = '50%';
	export let height = 0;
	export let width = 0;
	export let sidebarOnLeft = true;
	export let isHorizontal = false;

	let innerWidth = 0;
	let innerHeight = 0;
	$: isMobile = innerWidth < 768 ? true : false;
	let splitControl: Split;
	let splitterSize = '0px';
	$: isMobile, setSplitControl();
	$: menuHeight = height > 0 ? height : innerHeight;
	$: menuWidth = width > 0 ? width : innerWidth;
	$: innerHeight, () => (menuHeight = innerHeight);
	$: innerWidth, () => (menuWidth = innerWidth);

	let minPrimaryWidth = sidebarOnLeft ? minSidebarWidth : minMapWidth;
	let minSecondaryWidth = sidebarOnLeft ? minMapWidth : minSidebarWidth;

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

	$: isMenuShown, opened();
	const opened = () => {
		setSplitControl();
	};

	$: if (splitControl) {
		opened();
	}

	const splitterChanged = debounce((event) => {
		resizeMap();

		const { percent, primarySize, splitterSize, secondarySize, dragging } = event.detail;

		dispatch('changed', {
			percent,
			primarySize,
			splitterSize,
			secondarySize,
			dragging
		});
	}, 300);
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
		<div slot="primary" class="primary-content">
			{#if sidebarOnLeft}
				<slot name="sidebar" />
			{:else}
				<slot name="map" />
			{/if}
		</div>

		<div slot="secondary" class="secondary-content">
			{#if sidebarOnLeft}
				<slot name="map" />
			{:else}
				<slot name="sidebar" />
			{/if}
		</div>
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
