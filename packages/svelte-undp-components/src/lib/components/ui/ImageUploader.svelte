<script lang="ts">
	import { initTooltipTippy } from '$lib/util/initTippy';
	import Dropzone from '@undp-data/svelte-file-dropzone';
	import FieldControl from './FieldControl.svelte';

	const tippyTooltip = initTooltipTippy();

	interface Props {
		/**
		 * Image data URI string
		 */
		dataUrl: string | undefined;
		/**
		 * The list of accepted image file extensions
		 */
		acceptedExts?: string[];
		/**
		 * onchange event
		 * @param value image data URI string
		 */
		onchange?: (value: string) => void;
	}

	let {
		dataUrl = $bindable(),
		acceptedExts = ['.png', '.jpeg', '.jpg', '.webp', '.svg', '.gif'],
		onchange = () => {}
	}: Props = $props();

	const handleFileSelect = async (e: { detail: { acceptedFiles: File[] } }) => {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length === 0) return;
		const targetFile = acceptedFiles[0];
		const url = await file2dataurl(targetFile);
		dataUrl = url;
		if (onchange) onchange(dataUrl);
	};

	const handleRemoveFile = () => {
		dataUrl = undefined;
		if (onchange) onchange('');
	};

	const file2dataurl = (file: File): Promise<string> => {
		return new Promise((resolve) => {
			// Encode the file using the FileReader API
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(reader.result as string);
			};
			reader.readAsDataURL(file);
		});
	};
</script>

<div class="is-flex">
	{#if dataUrl}
		<div class="image-container">
			<img class="image" src={dataUrl} alt="slide figure" />
			<button
				class="delete"
				use:tippyTooltip={{ content: 'Remove the image from this slide.' }}
				onclick={handleRemoveFile}
				aria-label="delete"
			></button>
		</div>
	{:else}
		<div class="dropzone">
			<FieldControl title="Upload an image" showHelp={true} showHelpPopup={false}>
				{#snippet control()}
					<div>
						<Dropzone
							accept={acceptedExts.join(',')}
							noClick={false}
							multiple={false}
							inputElement={undefined}
							on:drop={async (e) => await handleFileSelect(e)}
						>
							<div
								style="display: flex; justify-content: center; align-items: center; height: 100%"
							>
								<p>Drag & drop or select a file here</p>
							</div>
						</Dropzone>
					</div>
				{/snippet}
				{#snippet help()}
					<div>
						<p>
							The following image formats are acceptable: {acceptedExts.join(', ')}
						</p>
					</div>
				{/snippet}
			</FieldControl>
		</div>
	{/if}
</div>

<style lang="scss">
	.image-container {
		position: relative;

		.image {
			background-color: #d4d6d8;
			max-height: 100px;
		}

		.delete {
			position: absolute;
			top: 3px;
			right: 3px;
		}
	}

	.dropzone {
		width: 100%;
	}
</style>
