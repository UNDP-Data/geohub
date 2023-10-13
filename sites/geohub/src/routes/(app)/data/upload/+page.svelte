<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	// import FieldControl from '$components/util/FieldControl.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { AccepedExtensions } from '$lib/config/AppConfig';
	import { BlockBlobClient } from '@azure/storage-blob';
	import { TextInput } from '@undp-data/svelte-undp-design';
	import JSZip from 'jszip';
	import { toast } from '@zerodevx/svelte-toast';
	import { filesize } from 'filesize';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import isValidFilename from 'valid-filename';
	import type { PageData } from './$types';

	const REDIRECT_TIME = 2000; // two second
	const FILE_SIZE_THRESHOLD = 104857600; // 100MB

	export let data: PageData;
	let config = data.config;

	let selectedFile: File;
	let file: File;
	let selectedFiles: Array<File> = [];
	let selectedFileName: string;

	// $: selectedFileName = selectedFile?.name === undefined ? uuidv4() : selectedFile?.name

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
		}, REDIRECT_TIME);

		toast.push('Successfully uploaded the file to GeoHub! It is going back to Data page.', {
			duration: REDIRECT_TIME
		});

		return {
			success: true,
			blobUrl: blobUrl
		};
	};

	const completeUploading = async () => {
		const formData = new FormData();
		formData.append('blobUrl', blobUrl);
		formData.append('join_vectortiles', `${config.DataPageIngestingJoinVectorTiles}`);
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
		let { acceptedFiles } = e.detail;

		if (selectedFiles.length > 0) {
			// filter and append the unique ones
			acceptedFiles = acceptedFiles.filter(
				(file) => !selectedFiles.some((f) => f.name === file.name)
			);
			acceptedFiles = [...selectedFiles, ...acceptedFiles];
		}
		console.log(acceptedFiles);
		if (acceptedFiles.length === 0) {
			return;
		}
		if (acceptedFiles.length > 1) {
			acceptedFiles = acceptedFiles.filter((file) => file.name.split('.').length > 1);
			selectedFiles = acceptedFiles;
			selectedFileName = `${selectedFiles[0].name.split('.').at(-2)}-etc.zip`;
			const zip = new JSZip();
			selectedFiles.forEach((file: File) => {
				zip.file(file.name, file);
			});
			zip.generateAsync({ type: 'blob' }).then((content) => {
				file = new File([content], `${selectedFileName}`, { type: 'application/zip' });
				// no need to run checks on zip as zip is always valid
				selectedFile = file;
			});
		} else {
			file = acceptedFiles[0];
			const names: string[] = file.name.split('.');
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
			selectedFileName = selectedFile.name;
			selectedFiles = [file];
		}
	};

	const openFilePick = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = AccepedExtensions.map((ext) =>
			ext.extensions.map((e) => `.${e}`).join(',')
		).join(',');
		input.click();
		input.onchange = (e) => {
			let files = e.target.files;
			console.log(files);
			if (!files || files.length === 0) {
				return;
			}
			files = Array.from(files).map((file) => {
				// FIXME: The jsZip file object does not have name property
				file.path = file.name;
				return file;
			});
			selectedFiles = [...selectedFiles, ...files];
		};
	};

	const removeAllFiles = () => {
		selectedFiles = [];
		selectedFile = undefined;
		selectedFileName = undefined;
	};

	const removeFileWithPath = (path: string) => {
		selectedFiles = selectedFiles.filter((file) => file.path !== path);
	};

	console.log(
		AccepedExtensions.map((ext) => ext.extensions.map((e) => `.${e}`).join(', ')).join(',')
	);
</script>

{#if !data.session}
	<Notification type="warning" showCloseButton={false}>
		You have not signed in to GeoHub yet. To upload your dataset, please sign in to GeoHub first.
	</Notification>
{:else}
	<div class="column m-4 m-auto is-three-fifths py-5 has-content-centered">
		<p class="title is-4 has-text-centered">Upload your datasets</p>
		<Dropzone noClick={false} on:drop={handleFilesSelect}>
			<p>Drag & drop files here, or click to select files</p>
		</Dropzone>
		{#if selectedFiles.length > 0}
			{#if selectedFiles.length !== 1}
				<TextInput placeholder="Enter Name of Zip file" label="" bind:value={selectedFileName} />
			{/if}
			<div class="table-container mt-5">
				<table class="table fullwidth-table ml-auto mr-auto small default">
					<thead>
						<tr>
							<th>File Name</th>
							<th>File Size</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{#each selectedFiles as file}
							{@const path = file.path}
							<tr>
								<td>{path}</td>
								<td>{(file.size / 1000000).toFixed(3)}MB</td>
								<td><button on:click={() => removeFileWithPath(path)} class="delete"></button></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		<div class="columns mt-5">
			<form
				class="column is-flex is-justify-content-start"
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
				<div class="field">
					<div class="control">
						<button class="button is-primary" disabled={selectedFiles.length < 1} type="submit">
							<span class="icon">
								<i class="fa-solid fa-cloud-arrow-up" />
							</span>
							<span>Upload</span>
						</button>
					</div>
				</div>
			</form>
			<div class="column control is-flex is-flex is-justify-content-flex-end">
				<button on:click={openFilePick} class="button is-link mr-2"
					>Add {selectedFiles.length > 0 ? 'more' : ''}</button
				>
				<button on:click={removeAllFiles} disabled={selectedFiles.length < 1} class="button is-link"
					>Remove all</button
				>
			</div>
		</div>

		<!--{/if}-->

		{#await uploadingFile}
			<progress class="progress is-success" value={progress} max="100">{progress}%</progress>
			<p>{filesize(uploadedLength, { round: 1 })} / {filesize(selectedFile?.size, { round: 1 })}</p>
		{/await}

		<!--	<FieldControl-->
		<!--		title="Join multiple vector tiles into a single PMTiles or split to multipe PMTiles during ingesting">-->
		<!--		<div slot="help">-->
		<!--			If true, the data pipeline will create a single PMTiles with multiple vector tiles. This-->
		<!--			setting will be used during the data pipeline to ingest your uploaded dataset.-->
		<!--		</div>-->
		<!--		<div slot="control">-->
		<!--			<div class="field has-addons">-->
		<!--				<p class="control">-->
		<!--					<button-->
		<!--						type="button"-->
		<!--						class="button is-primary {config.DataPageIngestingJoinVectorTiles === true-->
		<!--							? ''-->
		<!--							: 'is-light'}"-->
		<!--						on:click={() => {-->
		<!--							config.DataPageIngestingJoinVectorTiles = true;-->
		<!--						}}-->
		<!--					>-->
		<!--						<span class="icon is-small">-->
		<!--							<i class="fas fa-file"></i>-->
		<!--						</span>-->
		<!--						<span>Single PMTiles</span>-->
		<!--					</button>-->
		<!--				</p>-->
		<!--				<p class="control">-->
		<!--					<button-->
		<!--						type="button"-->
		<!--						class="button is-primary {config.DataPageIngestingJoinVectorTiles === false-->
		<!--							? ''-->
		<!--							: 'is-light'}"-->
		<!--						on:click={() => {-->
		<!--							config.DataPageIngestingJoinVectorTiles = false;-->
		<!--						}}-->
		<!--					>-->
		<!--						<span class="icon is-small">-->
		<!--							<i class="fas fa-layer-group"></i>-->
		<!--						</span>-->
		<!--						<span>Multiple PMTiles</span>-->
		<!--					</button>-->
		<!--				</p>-->
		<!--			</div>-->
		<!--		</div>-->
		<!--	</FieldControl>-->

		<!--	<FieldControl title="Geospatial file">-->
		<!--		<div slot="help">-->
		<!--			Drag and drop, or select files to upload to GeoHub, then our data pipeline will ingest-->
		<!--			your data to be ready to use in GeoHub.-->
		<!--		</div>-->

		{#if selectedFile && selectedFile.size > FILE_SIZE_THRESHOLD}
			<div class="pt-2">
				<Notification type="warning" showCloseButton={false}>
					Your uploaded file size ({filesize(selectedFile?.size, { round: 1 })}) is large. You can
					still can proceed uploading it, but it may take time to ingest. Please consider using
					archived file format.
					<br />
					Our supported archive formats are {AccepedExtensions.find(
						(ext) => ext.name === 'Archive Formats'
					)
						.extensions.map((e) => `.${e}`)
						.join(', ')}.
				</Notification>
			</div>
		{/if}
		<!--		</div>-->
		<!--	</FieldControl>-->

		<!--	<p class="help is-link pb-2">-->
		<!--		The following file formats are supported in GeoHub. Click a file format name to learn more about-->
		<!--		the format.-->
		<!--	</p>-->
		<!--	<ul>-->
		<!--		{#each AccepedExtensions as ext}-->
		<!--			<li>-->
		<!--				<a href={ext.href} target="_blank"-->
		<!--					><p class="is-6 has-text-link p-0 m-0"><small class="has-text-link">-->
		<!--						{ext.name} ({ext.extensions.map((e) => `.${e}`).join(', ')})-->
		<!--					</small></p></a-->
		<!--				>-->
		<!--			</li>-->
		<!--		{/each}-->
		<!--	</ul>-->
	</div>
{/if}
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />

<style lang="scss">
	@use 'src/styles/base-minimal.min.css';

	.table-container {
		max-height: 500px;
		overflow-y: auto;
		.fullwidth-table {
			width: 100%;
		}
	}
</style>
