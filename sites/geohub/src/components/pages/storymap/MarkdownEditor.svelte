<script lang="ts">
	import type EasyMDE from 'easymde';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		maxHeight?: string;
		onchange?: (value: string) => void;
	}

	let {
		value = '',
		placeholder = 'Input contents in markdown...',
		maxHeight = '200px',
		onchange = () => {}
	}: Props = $props();

	let textareaElement: HTMLTextAreaElement | undefined = $state();
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
			maxHeight: maxHeight,
			sideBySideFullscreen: false,
			syncSideBySidePreviewScroll: false,
			status: false
		});

		easyMDE?.codemirror?.on(
			'change',
			debounce(() => {
				if (!easyMDE) return;
				value = easyMDE.value().trim();
				onchange(value);
			}, 300)
		);
	});
</script>

<template class="md-editor">
	<textarea bind:this={textareaElement} rows="6" {placeholder} bind:value></textarea>
</template>

<style lang="scss">
	@import 'easymde/dist/easymde.min.css';

	:global(.editor-toolbar) {
		border: 1px solid black;
		border-radius: 0 !important;
	}

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
	:global(.CodeMirror) {
		color: #2e333d !important;
		border: 1px solid black !important;
		border-top: none !important;
		border-radius: 0 !important;
	}
</style>
