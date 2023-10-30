<script lang="ts">
	import { filesize } from 'filesize';

	export let url: string;
	export let title = '';
	let extension = '';

	const fileUrl = url.split('?')[0];
	const filePath = fileUrl.split('/');
	const fileName = filePath[filePath.length - 1];
	if (!title) {
		title = fileName;
	}
	const fileExtensions = fileName.split('.');
	extension = '';
	if (fileExtensions.length > 1) {
		extension = fileExtensions[fileExtensions.length - 1].toLocaleUpperCase();
	}

	let fileFormat = extension;

	const getFileSize = () => {
		return new Promise<void>((resolve) => {
			const fileUrl = url.replace('pmtiles://', '');
			let bytes = 'N/A';
			fetch(fileUrl.toString()).then((res) => {
				if (res.ok) {
					const contentLength = res.headers.get('content-length');
					if (contentLength) {
						bytes = filesize(Number(contentLength), { round: 1 }) as string;
					}
				}
				fileFormat = `${fileFormat} (${bytes})`;
				resolve();
			});
		});
	};

	$: if (url) {
		getFileSize();
	}
</script>

<div class="download-card">
	<a href={url}>
		<div class="description">
			{#if title}
				<p class="title">{title}</p>
			{/if}
			<p class="format">
				{fileFormat}
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
