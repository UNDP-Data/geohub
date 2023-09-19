<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { AccepedExtensions, SiteInfo } from '$lib/config/AppConfig';
	import { BlockBlobClient } from '@azure/storage-blob';
	import { toast } from '@zerodevx/svelte-toast';
	import { filesize } from 'filesize';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import isValidFilename from 'valid-filename';

	const REDIRECRT_TIME = 2000; // two second

	let fileInput: HTMLInputElement;
	let selectedFile: File;
	$: selectedFileName = selectedFile?.name;

	let uploadingFile: Promise<{ success: boolean }>;
	let uploadedLength = 0;
	$: progress = selectedFile ? (uploadedLength / selectedFile?.size) * 100 : 0;

	let blobUrl = '';

	const uploadFile = async (sasUrl: string) => {
		if (!selectedFile) {
			return;
		}
		uploadedLength = 0;
		const blockBlobClient = new BlockBlobClient(sasUrl);
		const promises = [];
		promises.push(blockBlobClient.uploadData(selectedFile, { onProgress: onProgress }));
		await Promise.all(promises);

		const blobUrl = await completeUploading();

		setTimeout(() => {
			goto('/data#mydata', {
				replaceState: true
			});
		}, REDIRECRT_TIME);

		toast.push('Successfully uploaded the file to GeoHub! It is going back to Data page.', {
			duration: REDIRECRT_TIME
		});

		return {
			success: true,
			blobUrl: blobUrl
		};
	};

	const completeUploading = async () => {
		const formData = new FormData();
		formData.append('blobUrl', blobUrl);
		const res = await fetch('/data/upload?/completingUpload', {
			method: 'POST',
			body: formData
		});
		const json = await res.json();
		if (json.status !== 200) {
			const message = json.message ?? 'Failed to complete uploading' ?? res.statusText;
			toast.push(message);
			throw new Error(message);
		}
		const data = JSON.parse(JSON.parse(json.data)[0]);
		return data.blobUrl;
	};

	const onProgress = (e) => {
		uploadedLength = e.loadedBytes;
	};

	const handleFilesSelect = (e) => {
		selectedFile = undefined;
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length > 1) {
			toast.push('Please select only a file. Make zip file if they are multiple files,');
			return;
		}
		const file = acceptedFiles[0];
		const names: string[] = file.path.split('.');
		if (names.length < 2) {
			toast.push('Please choose a supported file.');
			return;
		}

		if (
			!isValidFilename(names[0]) ||
			/[+\s&%]/g.test(names[0]) ||
			/[^\u0000-\u007F]+/g.test(names[0]) // eslint-disable-line no-control-regex
		) {
			toast.push(
				`Special characters (<, >, ", /, \\, |, ?, *, +, &, %, space, tab and non-ascii letters) cannot be used in file name.`
			);
			return;
		}

		const extension: string = names[1].toLowerCase().trim();
		const formats = AccepedExtensions.filter((ext) => ext.extensions.includes(extension));
		if (formats.length === 0) {
			toast.push(`The file extension '${extension}' is not supported.`);
			return;
		}
		selectedFile = file;
	};

	let title = 'Data upload | GeoHub';
	let content = 'Data upload';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

<div class="m-4 py-5">
	<p class="title is-4">Upload data to GeoHub</p>

	<form
		method="POST"
		action="?/getSasUrl"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				const sasUrl = result.data.sasUrl;
				blobUrl = result.data.blobUrl;
				uploadingFile = uploadFile(sasUrl);
			};
		}}
	>
		<input class="input" type="hidden" name="fileName" bind:value={selectedFileName} />

		<div class="field is-grouped py-4">
			<div class="control">
				<button class="button is-primary" type="submit" disabled={!selectedFile}>
					<span class="icon">
						<i class="fa-solid fa-cloud-arrow-up" />
					</span>
					<span>Upload</span>
				</button>
			</div>
		</div>
	</form>

	{#await uploadingFile}
		<progress class="progress is-success" value={progress} max="100">{progress}%</progress>

		<p>{filesize(uploadedLength, { round: 1 })} / {filesize(selectedFile?.size, { round: 1 })}</p>
		<!-- {:then result}
  {#if result?.success}
    <Notification
      type="info"
      showCloseButton={false}>Successfully uploaded the file to GeoHub! It is going back to Data page.</Notification>
  {/if} -->
	{/await}

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Geospatial file</label>
		<div class="control">
			<p class="subtitle is-6 m-0 pb-2">Select a geospatial file to upload to GeoHub.</p>

			<Dropzone noClick={true} on:drop={handleFilesSelect}>
				<p>Drag & drop a file here, or click the below button to select a file</p>
			</Dropzone>

			<div class="file has-name pt-2">
				<label class="file-label">
					<input
						class="file-input"
						type="file"
						bind:this={fileInput}
						on:change={() => {
							const files = fileInput.files;
							if (!files || files.length === 0) {
								selectedFile = undefined;
								return;
							}
							selectedFile = files[0];
						}}
					/>
					<span class="file-cta">
						<span class="file-icon">
							<i class="fas fa-upload" />
						</span>
						<span class="file-label"> Choose a file… </span>
					</span>
					{#if selectedFile}
						<span class="file-name">
							<p>{selectedFile.name} ({filesize(selectedFile?.size, { round: 1 })})</p>
						</span>
					{/if}
				</label>
			</div>
			<p class="help is-link pb-2">
				The following file formats are supported in GeoHub. Click a file format name to learn more
				about the format.
			</p>
			<ul>
				{#each AccepedExtensions as ext}
					<li>
						<a href={ext.href} target="_blank"
							><p class="subtitle is-6 has-text-link pt-1">
								{ext.name} ({ext.extensions.map((e) => `.${e}`).join(', ')})
							</p></a
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
