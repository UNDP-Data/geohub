<script lang="ts">
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, FloatingPanel } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext } from 'svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';

	const dispatch = createEventDispatcher();

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	export let width = 360;
	export let height = 500;

	let panelHeaderHeight: 0;
	$: tabContentHeight = height - panelHeaderHeight - 30;

	const handleClose = () => {
		dispatch('close');
	};
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
				<div class="mx-4 my-2">
					<FieldControl title="description" showHelp={true} showHelpPopup={false}>
						<div slot="control">
							<MarkdownEditor bind:value={$configStore.footer} />
						</div>
						<div slot="help">
							<p>
								Use this field to provide additional information such as credits, methodology notes,
								sources, or references.
							</p>

							<p>If footer text is not needed, please leave it as empty. It will be hidden.</p>
						</div>
					</FieldControl>
				</div>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	.editor-container {
		overflow-y: auto;
	}
</style>
