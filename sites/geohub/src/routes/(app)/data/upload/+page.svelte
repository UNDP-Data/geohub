<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Notification from '$components/util/Notification.svelte';
	import { AccepedExtensions } from '$lib/config/AppConfig';
	import { BlockBlobClient } from '@azure/storage-blob';
	import { TextInput, Checkbox } from '@undp-data/svelte-undp-design';
	import JSZip from 'jszip';
	import { toast } from '@zerodevx/svelte-toast';
	import { filesize } from 'filesize';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import isValidFilename from 'valid-filename';
	import type { PageData } from './$types';
	import Time from 'svelte-time';
	import FieldControl from '$components/util/FieldControl.svelte';

	const REDIRECT_TIME = 2000; // two second
	const FILE_SIZE_THRESHOLD = 104857600; // 100MB

	export let data: PageData;
	let config = data.config;

	let selectedFile: File;
	let file: File;
	let selectedFiles: Array<File> = [];
	let selectedFileName: string;
	let shapefileValidityMapping: Record<string, string[]>;

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
			// filter and append the only the unique files
			acceptedFiles = acceptedFiles.filter(
				(file) => !selectedFiles.some((f) => f.name === file.name)
			);
			acceptedFiles = [...selectedFiles, ...acceptedFiles];
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
		shapefileValidityMapping = checkShapefileIsValid(acceptedFiles);

		// TODO: DON'T DELETE THIS COMMENTED CODE. IT IS FOR IMPLEMENTING ZIPPED SHAPEFILE VALIDITY CHECK
		// let fileList = []
		// const zipFiles = acceptedFiles.filter((file) => file.name.split('.').at(-1) === 'zip');
		// const promises = zipFiles.map((zipFile) => {
		// 	const jszip = new JSZip();
		// 	return jszip.loadAsync(zipFile).then((zip) => {
		// 		const zipEntryPromises = [];
		//
		// 		zip.forEach((relativePath, zipEntry) => {
		// 			if (!zipEntry.dir) {
		// 				zipEntryPromises.push(
		// 					zipEntry.async('blob').then((blob) => {
		// 						fileList.push({
		// 							name: zipEntry.name,
		// 							path: `${zipFile.name}/${zipEntry.name}`,
		// 							size: blob.size,
		// 							lastModified: zipEntry.date
		// 						});
		// 					})
		// 				);
		// 			}
		// 		});
		// 		// Return a Promise that resolves when all zip entry Promises are done
		// 		return Promise.all(zipEntryPromises);
		// 	});
		// })
		//
		// // Use Promise.all to wait for all zip files to be processed
		// Promise.all(promises).then(() => {
		// 	// All asynchronous operations are complete, and fileList is populated with zip file contents
		// 	const zippedShapefileValidityMapping = checkShapefileIsValid(fileList, true);
		// 	console.log(zippedShapefileValidityMapping);
		// });
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
		shapefileValidityMapping = checkShapefileIsValid(selectedFiles);
	};

	const checkShapefileIsValid = (fileList: Array<File>) => {
		// check that the other mandatory files are present
		const mandatoryShapefileExtensions = AccepedExtensions.find(
			(ext) => ext.name === 'ESRI Shapefile'
		).requiredExtensions;

		// get all the shapefiles files
		const shapefileFiles = fileList.map((file) => {
			// check if the file has a valid shapefile extension
			const extension = file.name.split('.').at(-1);
			if (mandatoryShapefileExtensions.includes(extension)) {
				return file.name;
			}
		});

		// group by similar file names. Shapefile names need to be similar to be valid
		const groupedShapefileFiles = shapefileFiles.reduce((acc, curr) => {
			if (!curr) {
				return acc;
			}
			const name = curr.split('.').slice(0, -1).join('.');
			if (!acc[name]) {
				acc[name] = [];
			}
			acc[name].push(curr);
			return acc;
		}, {});

		// check if all mandatory files are present for each group and return the missing files for each group in a mapping
		return Object.keys(groupedShapefileFiles).reduce((acc, curr) => {
			const missing = mandatoryShapefileExtensions.filter(
				(ext) => !groupedShapefileFiles[curr].includes(`${curr}.${ext}`)
			);
			if (missing.length > 0) {
				acc[curr] = missing;
			}
			return acc;
		}, {});
	};
</script>

{#if !data.session}
	<Notification type="warning" showCloseButton={false}>
		You have not signed in to GeoHub yet. To upload your dataset, please sign in to GeoHub first.
	</Notification>
{:else}
	<div class="column m-4 m-auto is-three-fifths py-5 has-content-centered">
		<p class="title is-4 has-text-centered">Upload your datasets</p>
		<Dropzone
			accept={AccepedExtensions.map((ext) => ext.extensions.map((e) => `.${e}`).join(', ')).join(
				','
			)}
			noClick={false}
			on:drop={handleFilesSelect}
		>
			<p>Drag & drop files here, or click to select files</p>
		</Dropzone>
		{#if selectedFiles.length > 0}
			{#if selectedFiles.length !== 1}
				<FieldControl title="Change the name of the zip archive created">
					<div slot="help">Change the name of the zip archive created</div>
					<div slot="control">
						<TextInput
							label="Name of archive"
							placeholder="Enter Name of Zip file"
							bind:value={selectedFileName}
						/>
					</div>
				</FieldControl>
			{/if}
			<div class="table-container mt-5">
				<table class="table fullwidth-table ml-auto mr-auto small default">
					<thead>
						<tr>
							<th>File Name</th>
							<th>File Size</th>
							<th>Last Modified</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each selectedFiles as file}
							{@const path = file.path}
							<tr>
								<td>
									<span>{path}</span>
									{#if Object.keys(shapefileValidityMapping).length > 0}
										{#if path.split('.').pop() === 'shp'}
											{@const filename = path.split('.').slice(0, -1).join('.')}
											<span class="tag is-danger is-light has-text-danger"
												><small>Missing: {shapefileValidityMapping[filename]}</small></span
											>
										{/if}
									{/if}
								</td>
								<td>{(file.size / 1000000).toFixed(3)}MB</td>
								<td><Time timestamp={file.lastModified} format="h:mm A, MMMM D, YYYY" /></td>
								<td><button on:click={() => removeFileWithPath(path)} class="delete"></button></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		<Checkbox
			on:clicked={() =>
				(config.DataPageIngestingJoinVectorTiles = !config.DataPageIngestingJoinVectorTiles)}
			checked={config.DataPageIngestingJoinVectorTiles === true}
			label="Merge vector layers into one dataset?"
		/>
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

		{#await uploadingFile}
			<progress class="progress is-success" value={progress} max="100">{progress}%</progress>
			<p>{filesize(uploadedLength, { round: 1 })} / {filesize(selectedFile?.size, { round: 1 })}</p>
		{/await}

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
	</div>
{/if}

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
