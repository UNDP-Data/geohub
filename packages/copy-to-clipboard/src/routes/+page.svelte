<script lang="ts">
	import { CopyToClipboard } from '$lib';

	let value1 = 'copy single line text';
	let value2 = `copy multile text\ncopy multile text`;
	let value3 = 'https://geohub.data.undp.org/';

	let placeholder = 'Copy to clipboard';
	let textCopy = 'Copy';
	let textCopied = 'Copied';
	let width = '100%';
	let timeout = 5000;
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
		integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<div class="p-4">
	<h1 class="is-title is-size-1">Welcome to copy-to-clipboard</h1>

	<h2 class="is-title is-size-2">Basic usage</h2>

	<p class="is-size-5">Single line</p>
	<CopyToClipboard
		bind:value={value1}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
	/>

	<br />

	<p class="is-size-5">Multiline</p>
	<CopyToClipboard
		bind:value={value2}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={true}
	/>

	<br />

	<p class="is-size-5">URL</p>
	<CopyToClipboard
		bind:value={value3}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
		openNewTab={true}
	/>

	<h2 class="is-title is-size-2">Sizing</h2>

	<p class="is-size-5">small size</p>
	<CopyToClipboard
		bind:value={value3}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
		size="small"
	/>

	<br />

	<p class="is-size-5">normal size</p>
	<CopyToClipboard
		bind:value={value3}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
		size="normal"
	/>

	<br />

	<p class="is-size-5">medium size</p>
	<CopyToClipboard
		bind:value={value3}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
		size="medium"
	/>

	<br />

	<p class="is-size-5">large size</p>
	<CopyToClipboard
		bind:value={value3}
		{placeholder}
		{textCopy}
		{textCopied}
		{width}
		{timeout}
		isMultiline={false}
		size="large"
	/>
</div>
