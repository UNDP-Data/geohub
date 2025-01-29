<script lang="ts">
	import {
		STORYMAP_CONFIG_STORE_CONTEXT_KEY,
		type StoryMapConfigStore
	} from '@undp-data/svelte-maplibre-storymap';
	import { FieldControl, FloatingPanel } from '@undp-data/svelte-undp-components';
	import { getContext } from 'svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';

	let configStore: StoryMapConfigStore = getContext(STORYMAP_CONFIG_STORE_CONTEXT_KEY);

	interface Props {
		width?: number;
		height?: number;
		onclose?: () => void;
	}

	let { width = $bindable(360), height = $bindable(500), onclose = () => {} }: Props = $props();

	let panelHeaderHeight = $state(0);
	let tabContentHeight = $derived(height - panelHeaderHeight - 30);

	const handleClose = () => {
		if (onclose) onclose();
	};
</script>

<div style="width: {width}px;">
	<FloatingPanel
		title="Footer slide settings"
		showExpand={false}
		onclose={handleClose}
		bind:headerHeight={panelHeaderHeight}
	>
		<div class="editor-container" style="height: {tabContentHeight}px;">
			{#if $configStore}
				<div class="mx-4 my-2">
					<FieldControl title="description" showHelp={true} showHelpPopup={false}>
						{#snippet control()}
							<div>
								<MarkdownEditor bind:value={$configStore.footer} />
							</div>
						{/snippet}
						{#snippet help()}
							<div>
								<p>
									Use this field to provide additional information such as credits, methodology
									notes, sources, or references.
								</p>

								<p>If footer text is not needed, please leave it as empty. It will be hidden.</p>
							</div>
						{/snippet}
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
