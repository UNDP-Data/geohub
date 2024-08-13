<script lang="ts">
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { Accordion, FloatingPanel } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	export let width = 360;
	export let height = 500;

	let panelHeaderHeight: 0;
	$: tabContentHeight = height - panelHeaderHeight - 30;

	const handleClose = () => {
		dispatch('close');
	};

	let expanded: { [key: string]: boolean } = { text: true };
	// to allow only an accordion to be expanded
	let expandedId: string;
	$: {
		let expandedIds = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedIds.length > 0) {
			expandedId = expandedIds[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedIds[0]] = true;
		}
	}
</script>

<div style="width: {width}px;">
	<FloatingPanel
		title="Footer slide settings"
		showExpand={false}
		on:close={handleClose}
		bind:headerHeight={panelHeaderHeight}
	>
		<div class="editor-container" style="height: {tabContentHeight}px;">
			{#if $configStore}
				<Accordion title="Footer Text" bind:isExpanded={expanded['text']}>
					<div slot="content">
						<input
							class="input"
							type="text"
							bind:value={$configStore.footer}
							placeholder="Input title..."
						/>
						<span class="help content">
							<p>
								Type any information to be presented in the last slide of storymap. This can be any
								credit information like copyright.
							</p>

							<p>If you don't want to show any footer, leave it blank.</p>
						</span>
					</div>
				</Accordion>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	.editor-container {
		overflow-y: auto;
	}
</style>
