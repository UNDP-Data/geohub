<script lang="ts">
	import type EasyMDE from 'easymde';
	import { debounce } from 'lodash-es';
	import { onDestroy, onMount } from 'svelte';
	export let value = '';
	export let placeholder = 'Input contents in markdown...';

	let textareaElement: HTMLTextAreaElement;
	let easyMDE: EasyMDE | null;
	onMount(async () => {
		// https://github.com/Ionaru/easy-markdown-editor
		const EasyMDE = (await import('easymde')).default;
		if (easyMDE) {
			easyMDE.toTextArea();
			easyMDE = null;
		}
		easyMDE = new EasyMDE({
			element: textareaElement,
			minHeight: '100px',
			maxHeight: '200px',
			sideBySideFullscreen: false,
			syncSideBySidePreviewScroll: false,
			status: false
		});

		easyMDE?.codemirror?.on(
			'change',
			debounce(() => {
				if (!easyMDE) return;
				value = easyMDE.value().trim();
			}, 300)
		);
	});

	onDestroy(() => {
		if (easyMDE) {
			easyMDE.toTextArea();
			easyMDE = null;
		}
	});
</script>

<template class="md-editor">
	<textarea bind:this={textareaElement} rows="6" {placeholder} bind:value></textarea>
</template>

<style lang="scss">
	@import 'easymde/dist/easymde.min.css';

	:global(.editor-toolbar .image) {
		display: none !important;
	}

	:global(.editor-toolbar .preview) {
		display: none !important;
	}
	:global(.editor-toolbar .side-by-side) {
		display: none !important;
	}
	:global(.editor-toolbar .fullscreen) {
		display: none !important;
	}
	:global(.editor-toolbar .fullscreen + .separator) {
		display: none !important;
	}
</style>
