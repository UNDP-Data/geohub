<script lang="ts">
	import { filesize } from 'filesize';

	export let url: string;
	export let title = '';
	export let bytes = 0;

	export const downloadFile = () => {
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
</script>

<div class="download-card">
	<!-- svelte-ignore a11y-missing-attribute -->
	<a role="button" on:click={downloadFile} on:keydown={handleKeyDown}>
		<div class="description">
			{#if title}
				<p class="title">{title}</p>
			{/if}
			{#if bytes > 0}
				<p class="format">PDF ({filesize(bytes, { round: 2, precision: 1 })})</p>
			{/if}
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
			max-width: 330px;

			.title {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
</style>
