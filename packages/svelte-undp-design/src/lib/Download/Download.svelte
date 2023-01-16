<script lang="ts">
	import { filesize } from 'filesize';

	export let url: string;
	export let title = '';
	export let bytes: number | undefined = undefined;
	let extension = '';

	const downloadFile = () => {
		const element = document.createElement('a');
		element.href = url;
		element.download = url;
		element.click();
		element.remove();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			downloadFile();
		}
	};

	const fileUrl = new URL(url);
	const filePath = fileUrl.pathname.split('/');
	const fileName = filePath[filePath.length - 1];
	if (!title) {
		title = fileName;
	}
	const fileExtensions = fileName.split('.');
	extension = '';
	if (fileExtensions.length > 1) {
		extension = fileExtensions[fileExtensions.length - 1].toLocaleUpperCase();
	}
</script>

<div class="download-card">
	<!-- svelte-ignore a11y-missing-attribute -->
	<a role="button" on:click={downloadFile} on:keydown={handleKeyDown}>
		<div class="description">
			{#if title}
				<p class="title">{title}</p>
			{/if}
			<p class="format">
				{extension} ({bytes && bytes > 0 ? filesize(bytes, { round: 1 }) : 'N/A'})
			</p>
			<span class="download">
				Download
				<span class="download-animated"><i /></span>
			</span>
		</div>
	</a>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/download-card.min.css';

	.download-card {
		cursor: pointer;

		.description {
			width: fit-content;
			max-width: 300px;
		}
	}
</style>
