<script lang="ts">
	import Dropzone from '@undp-data/svelte-file-dropzone';
	import { initTooltipTippy } from '@undp-data/svelte-undp-components';

	const tippyTooltip = initTooltipTippy();

	export let dataUrl: string | undefined;

	const acceptedExts = ['.png', '.jpeg', '.jpg', '.webp', '.svg'];

	const handleFileSelect = async (e) => {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length === 0) return;
		const targetFile = acceptedFiles[0];
		const url = await file2dataurl(targetFile);
		dataUrl = url;
	};

	const handleRemoveFile = () => {
		dataUrl = undefined;
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
				on:click={handleRemoveFile}
			/>
		</div>
	{:else}
		<Dropzone
			accept={acceptedExts.join(',')}
			noClick={false}
			multiple={false}
			inputElement={undefined}
			on:drop={async (e) => await handleFileSelect(e)}
		>
			<div style="display: flex; justify-content: center; align-items: center; height: 100%">
				<p>Drag & drop or select a file here</p>
			</div>
		</Dropzone>
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
</style>
