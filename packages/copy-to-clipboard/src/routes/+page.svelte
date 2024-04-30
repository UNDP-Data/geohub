<script lang="ts">
	import { CopyToClipboard } from '$lib';
	import '@undp-data/undp-bulma/dist/style.css';

	let value1 = 'copy single line text';
	let value2 = `copy multile text\ncopy multile text`;
	let value3 = 'https://geohub.data.undp.org/';

	let placeholder = 'Copy to clipboard';
	let textCopy = 'Copy';
	let textCopied = 'Copied';
	let width = '100%';
	let timeout = 5000;
</script>

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
