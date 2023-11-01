<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import Help from '$components/util/Help.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { AccepedExtensions } from '$lib/config/AppConfig';
	import { AbortController } from '@azure/abort-controller';
	import { BlockBlobClient } from '@azure/storage-blob';
	import { Checkbox, DefaultLink } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { filesize } from 'filesize';
	import JSZip from 'jszip';
	import { onMount } from 'svelte';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import Time from 'svelte-time';
	import isValidFilename from 'valid-filename';
	import type { PageData } from './$types';

	const REDIRECT_TIME = 2000; // two second
	const FILE_SIZE_THRESHOLD = 104857600; // 100MB

	export let data: PageData;
	let config = data.config;

	let selectedFile: File;
	let file: File;
	let selectedFiles: Array<File> = [];
	let errorMessages = [];
	let fileSasBlobUrlMapping = {};
	let isUploading = false;
	let filesToUpload = [];
	let shapefileValidityMapping = {};
	let uploadStatusMapping = {};
	let uploadTasks = [];
	let uploadProgressMapping = {};

	$: showErrorMessages = errorMessages.length > 0;
	$: uploadDisabled = Object.keys(shapefileValidityMapping).length > 0 || filesToUpload.length < 1;
	$: selectedFilesList = JSON.stringify(filesToUpload.map((file) => file.name));
	$: checkShapefileValidity(filesToUpload).then((result) => (shapefileValidityMapping = result));
	$: userIsSignedIn = data.session;

	onMount(() => {
		// if user is not signed in, redirect to the sign in page
		if (!userIsSignedIn) {
			setTimeout(() => {
				goto('/auth/signIn', {
					replaceState: true
				});
			}, REDIRECT_TIME);
		}
	});

	const checkShapefileValidity = async (fileList: Array<File>) => {
		const zipFiles = fileList.filter((file) => file.name.split('.').at(-1) === 'zip');
		let zipFilesList = await getZipFilesList(zipFiles);
		// check that the other mandatory files are present
		const mandatoryShapefileExtensions = AccepedExtensions.find(
			(ext) => ext.name === 'ESRI Shapefile'
		).requiredExtensions;

		const shapefileExtensions = AccepedExtensions.find(
			(ext) => ext.name === 'ESRI Shapefile'
		).extensions;

		// get all the shapefiles files
		const shapefileFiles = zipFilesList.map((file) => {
			// check if the file has a valid shapefile extension
			const extension = file.path.split('.').at(-1);
			if (shapefileExtensions.includes(extension)) {
				return file.path;
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

	const getZipFilesList = async (files: Array<File>) => {
		let zipFileList = [];
		const promises = files.map(async (zipFile) => {
			const jszip = new JSZip();
			return jszip.loadAsync(zipFile).then((zip) => {
				const zipEntryPromises = [];

				zip.forEach((relativePath, zipEntry) => {
					if (!zipEntry.dir) {
						zipEntryPromises.push(
							zipEntry.async('blob').then((blob) => {
								zipFileList.push({
									name: zipEntry.name,
									path: zipFile.path
										? zipEntry.name
										: `${zipFile.name.replace('.zip', '')}/${zipEntry.name}`,
									size: blob.size,
									lastModified: zipEntry.date
								});
							})
						);
					}
				});
				// Return a Promise that resolves when all zip entry Promises are done
				return Promise.all(zipEntryPromises);
			});
		});
		// Use Promise.all to wait for all zip files to be processed
		return Promise.all(promises).then(() => zipFileList);
	};
	const getSelectedFiles = async (files) => {
		// from the selected files, get the shapefiles with the same name and return them
		if (files.length === 0) {
			return [];
		}
		let shapefileFiles = files.map((file) => {
			// check if the file has a valid shapefile extension
			const extension = file.name.split('.').at(-1);
			if (
				AccepedExtensions.find((ext) => ext.name === 'ESRI Shapefile').extensions.includes(
					extension
				)
			) {
				// return file if not undefined
				return file;
			}
		});

		shapefileFiles = shapefileFiles.filter((file) => file !== undefined);
		const nonShapefiles = files.filter(
			(file) => !shapefileFiles.map((f) => f.name).includes(file.name)
		);

		// group the shapefiles by name
		const groupedShapefileFiles = shapefileFiles.reduce((acc, curr) => {
			if (!curr) {
				return acc;
			}
			const name = curr.name.split('.').slice(0, -1).join('.');
			if (!acc[`${name}.zip`]) {
				acc[`${name}.zip`] = [];
			}
			acc[`${name}.zip`].push(curr);
			return acc;
		}, {});

		let shapefileZips = [];

		for (const key of Object.keys(groupedShapefileFiles)) {
			const files = groupedShapefileFiles[key];
			const zip = new JSZip();
			files.forEach((file: File) => {
				zip.file(file.name, file);
			});
			const content = await zip.generateAsync({ type: 'blob' });

			const file = new File([content], `${key}`, { type: 'application/zip' });
			shapefileZips = [...shapefileZips, file];
		}
		files = [...nonShapefiles, ...shapefileZips];
		return files;
	};

	const uploadFiles = async (filesSasBlobUrlMap) => {
		// Split the filesToUpload array into chunks of 5
		const chunkSize = 5;
		const fileChunks = [];
		for (let i = 0; i < filesToUpload.length; i += chunkSize) {
			fileChunks.push(filesToUpload.slice(i, i + chunkSize));
		}

		const uploadPromises = [];

		// Function to upload a chunk of files in parallel
		const uploadChunk = async (chunk) => {
			const promises = chunk.map((file) => {
				const fileName = file.name;
				const sasUrl = filesSasBlobUrlMap[fileName].sasUrl;
				const blobUrl = filesSasBlobUrlMap[fileName].blobUrl;
				return uploadFile(sasUrl, blobUrl, file);
			});
			return Promise.all(promises);
		};

		// Iterate through each chunk and start uploading them in parallel
		for (const chunk of fileChunks) {
			uploadPromises.push(uploadChunk(chunk));
		}

		// Wait for all chunks to finish uploading
		Promise.all(uploadPromises).then(() => {
			isUploading = false;
			toast.push(
				'Successfully uploaded the files to GeoHub! They are going back to the Data page.',
				{
					duration: REDIRECT_TIME
				}
			);
			setTimeout(() => {
				goto('/data#mydata', {
					replaceState: true
				});
			}, REDIRECT_TIME);
		});
	};

	const uploadFile = async (sasUrl: string, blobUrl: string, file: File) => {
		if (!file) {
			return;
		}
		const blockBlobClient = new BlockBlobClient(sasUrl);
		const cancelToken = new AbortController();
		uploadTasks = [
			...uploadTasks,
			{
				fileName: file.name,
				cancelToken: cancelToken
			}
		];
		const promises = [];
		const uploadPromise = blockBlobClient
			.uploadData(file, {
				onProgress: (e) => {
					uploadProgressMapping[file.name] = e.loadedBytes;
				},
				abortSignal: cancelToken.signal,
				concurrency: 8
			})
			.catch((e) => {
				if (e.name === 'AbortError') {
					// do nothing
				} else {
					toast.push(`Upload of ${file.name} failed caused by ${e.message}`);
				}
			});

		promises.push(uploadPromise);

		await Promise.all(promises);

		await completeUploading(blobUrl);
		return {
			success: true,
			blobUrl: blobUrl
		};
	};

	const completeUploading = async (blobUrl: string) => {
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

	const handleFilesSelect = async (e) => {
		let { acceptedFiles, fileRejections } = e.detail;
		if (fileRejections.length > 1 || acceptedFiles.length < 1) {
			errorMessages = [
				...errorMessages,
				'Some files could not be selected. Please ensure that the selected file has the correct extension.'
			];
			return;
		}
		acceptedFiles = await validateFileNames(acceptedFiles);
		if (selectedFiles.length > 0) {
			// filter and append only the unique files
			acceptedFiles = acceptedFiles.filter(
				(file) => !selectedFiles.some((f) => f.name === file.name)
			);
			acceptedFiles = [...selectedFiles, ...acceptedFiles];
		}
		if (acceptedFiles.length > 1) {
			acceptedFiles = acceptedFiles.filter((file) => file.name.split('.').length > 1); // filter out files without extension
			selectedFiles = acceptedFiles;
		} else if (acceptedFiles.length === 1) {
			file = acceptedFiles[0];
			selectedFiles = [file];
		} else {
			return;
		}
		filesToUpload = await getSelectedFiles(selectedFiles);
	};

	const openFilePick = async () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = AccepedExtensions.map((ext) =>
			ext.extensions.map((e) => `.${e}`).join(',')
		).join(',');
		input.click();
		input.onchange = async (e) => {
			let files = e.target.files;
			if (!files || files.length === 0) {
				return;
			}
			files = Array.from(files).map((file) => {
				// FIXME: The jsZip file object does not have name property
				file.path = file.name;
				return file;
			});
			files = await validateFileNames(files);
			// filter and append only the unique files
			files = files.filter((file: File) => !selectedFiles.some((f) => f.name === file.name));
			selectedFiles = [...selectedFiles, ...files];
			filesToUpload = await getSelectedFiles(selectedFiles);
		};
	};

	const removeAllFiles = () => {
		selectedFiles = [];
		filesToUpload = [];
		errorMessages = [];
		shapefileValidityMapping = {};
	};

	const removeFileWithIndex = async (index: number) => {
		if (filesToUpload.length === 1) {
			removeAllFiles();
			return;
		}
		const fileToDelete = filesToUpload[index];
		filesToUpload = filesToUpload.filter((file, i) => i !== index);
		delete shapefileValidityMapping[fileToDelete.name];
	};

	const validateFileNames = async (files: Array<File>) => {
		const validFiles = [];
		files.forEach((file) => {
			const names: string[] = file.name.split('.');
			const extension = names.at(-1);
			if (names.length < 2) {
				errorMessages = [
					...errorMessages,
					'Some files could not be selected. Please ensure that the selected file has the correct extension.'
				];
				return;
			}

			if (
				!isValidFilename(names[0]) ||
				/[+\s&%]/g.test(names[0]) ||
				/[^\u0000-\u007F]+/g.test(names[0]) // eslint-disable-line no-control-regex
			) {
				errorMessages = [
					...errorMessages,
					`Special characters (<, >, ", /, \\, |, ?, *, +, &, %, space, tab and non-ascii letters) cannot be used in file name ${names[0]}.${extension}`
				];
				return;
			}
			const formats = AccepedExtensions.filter((ext) => ext.extensions.includes(extension));
			if (formats.length === 0) {
				errorMessages = [...errorMessages, `The file extension '${extension}' is not supported.`];
				return;
			}
			validFiles.push(file);
		});
		return validFiles;
	};

	const cancelUpload = (fileName: string) => {
		const task = uploadTasks.find((task) => task.fileName === fileName);
		if (task) {
			task.cancelToken.abort();
			uploadTasks = uploadTasks.filter((task) => task.fileName !== fileName);
			delete uploadProgressMapping[fileName];
			uploadStatusMapping[fileName] = 'Upload cancelled';
		}
		if (uploadTasks.length === 0) {
			isUploading = false;
		}
	};
</script>

{#if !userIsSignedIn}
	<div class="column">
		<Notification type="warning" showCloseButton={false}>
			<div class="mt-5">
				<span
					>You have not signed in to GeoHub yet. To upload your dataset, please sign in to GeoHub
					first.</span
				>
				<p>
					Page will redirect automatically to the sign in page in
					<span class="has-text-danger">{REDIRECT_TIME / 1000}</span>
					<span>
						seconds. If you are not automatically redirected, click <a href="/auth/signIn">here</a> to
						sign in</span
					>
				</p>
			</div>
		</Notification>
	</div>
{/if}
<div class="column m-4 m-auto is-four-fifths py-5 has-content-centered">
	<p class="title is-4">Upload your datasets</p>

	<div class="my-2">
		<BackToPreviousPage defaultLink="/data#mydata" />
	</div>

	<Dropzone
		disabled={!userIsSignedIn || isUploading}
		class="dropzone"
		accept={AccepedExtensions.map((ext) => ext.extensions.map((e) => `.${e}`).join(', ')).join()}
		noClick={true}
		on:drop={async (e) => await handleFilesSelect(e)}
	>
		<div style="display: flex; justify-content: center; align-items: center; height: 100%">
			<p>Drag & drop files here</p>
		</div>
		<div class="file is-small is-boxed">
			<label class="file-label">
				<button
					disabled={!userIsSignedIn || isUploading}
					class="file-cta has-background-grey"
					on:click={openFilePick}
				>
					<span class="file-label has-text-white"> Select files </span>
				</button>
			</label>
		</div>
	</Dropzone>
	<div class="mt-2 ml-2">
		<span>
			To read about supported file formats in GeoHub,
			<DefaultLink title="click here" href="/data/supported-formats" target="_blank" />
		</span>
	</div>
	{#if filesToUpload.length > 0}
		<div class="table-container mt-5">
			{#if filesToUpload.length > 0}
				<table class="table fullwidth-table ml-auto mr-auto small default">
					<thead>
						<tr>
							<th>File Name</th>
							<th>File Size</th>
							<th>Last Modified</th>
							{#if isUploading}
								<th>Status</th>
							{/if}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each filesToUpload as file, index}
							{@const name = file.name}
							{@const path = file.path}

							<tr>
								<td>
									<div>
										<span>{path ? path.split('.').at(-2) : name.split('.').at(-2)}</span>
										{#if path}
											<span class="tag is-medium is-info is-light"
												>.{path ? path.split('.').at(-1) : name.split('.').at(-1)}</span
											>
										{/if}
										{#if name.split('.').at(-1) === 'zip'}
											{#await getZipFilesList([file]) then zipFiles}
												{#if path && shapefileValidityMapping[path.split('.').at(-2)]}
													<span class="tag is-medium is-danger is-light">
														<small
															>Missing: {shapefileValidityMapping[path.split('.').at(-2)]}</small
														>
													</span>
												{:else if shapefileValidityMapping[zipFiles[0].path.split('.').at(-2)]}
													<span class="tag is-medium is-danger is-light">
														<small
															>Missing: {shapefileValidityMapping[
																zipFiles[0].path.split('.').at(-2)
															]}</small
														>
													</span>
												{/if}

												{#if !path}
													<!-- Shapefiles that have been zipped by selecting multiple files for it will have no `path` property. This condition will only be true if shapefiles are selected-->
													<div>
														{#each zipFiles as zipFile}
															<span class="tag is-info is-medium is-light ml-1">
																<small>.{zipFile.name.split('.').at(-1)}</small>
															</span>
														{/each}
													</div>
												{/if}
											{/await}
										{/if}
									</div>
								</td>
								<td>{filesize(file.size)}</td>
								<td><Time timestamp={file.lastModified} format="h:mm A, MMMM D, YYYY" /></td>
								{#if !isUploading}
									<td>
										<button
											disabled={isUploading}
											on:click={() => removeFileWithIndex(index)}
											class="delete"
										></button>
									</td>
								{:else}
									<td>
										{#if uploadProgressMapping[file.name]}
											{@const uploadPercentage = Math.round(
												(uploadProgressMapping[file.name] / file.size) * 100
											)}
											<progress
												class="m-0 progress is-small {uploadPercentage < 50
													? 'is-danger'
													: uploadPercentage < 99
													? 'is-warning'
													: 'is-success'}"
												value={uploadPercentage}
												max="100"
												>{uploadProgressMapping[file.name]
													? uploadProgressMapping[file.name]
													: 0}%</progress
											>
											<p style="width: 150px" class="has-text-centered">
												{filesize(uploadProgressMapping[file.name], { round: 1 })} / {filesize(
													file?.size,
													{ round: 1 }
												)}
											</p>
										{/if}
										{#if uploadStatusMapping[name]}
											<span class="tag is-grey-light">{uploadStatusMapping[name]}</span>
										{/if}
									</td>
									<td>
										{#if !uploadStatusMapping[name]}
											<button on:click={() => cancelUpload(name)} class="delete"></button>
										{/if}
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<div class="column control is-flex is-flex is-justify-content-flex-end">
			<button
				on:click={removeAllFiles}
				disabled={filesToUpload.length < 1 || !userIsSignedIn || isUploading}
				class="button is-link">Clear all</button
			>
		</div>
	{/if}

	<div class="label is-normal is-flex is-align-items-center mt-5">
		<div class="ml-2 help">
			<Checkbox
				disabled={!userIsSignedIn || isUploading}
				on:clicked={() =>
					(config.DataPageIngestingJoinVectorTiles = !config.DataPageIngestingJoinVectorTiles)}
				checked={!config.DataPageIngestingJoinVectorTiles}
				label="Every layer (Point, Line, Polygon) into its own file"
			/>
		</div>
		<Help>
			Most of GIS data formats can hold more than one vector layer. The option below, if checked
			will result in extracting each layer a different dataset (own metadata, name and other
			properties). The alternative is to join all layers into one multi-layer dataset where layers
			are hidden inside and not discoverable directly.
		</Help>
	</div>

	<div class="columns mt-5">
		<form
			class="column is-fullwidth is-flex is-justify-content-left"
			method="POST"
			on:submit={() => (isUploading = true)}
			action="?/getSasUrl"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					fileSasBlobUrlMapping = result.data;
					await uploadFiles(fileSasBlobUrlMapping);
				};
			}}
		>
			<input class="input" type="hidden" name="SelectedFiles" bind:value={selectedFilesList} />
			<div class="pl-0 control column is-one-fifth">
				<button
					class="button is-large is-primary {isUploading ? 'is-loading' : ''}"
					disabled={uploadDisabled || isUploading}
					type="submit"
				>
					<span class="icon">
						<i class="fa-solid fa-cloud-arrow-up" />
					</span>
					<span>Upload</span>
				</button>
			</div>
		</form>
	</div>

	{#if showErrorMessages}
		{#each errorMessages as message}
			<div class="mt-3">
				<Notification
					type="danger"
					on:close={() => {
						errorMessages = errorMessages.filter((msg) => msg !== message);
					}}
				>
					There was an error selecting the file.
					<span>{message}</span>
				</Notification>
			</div>
		{/each}
	{/if}
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

<style lang="scss">
	:global(.dropzone) {
		height: 200px !important;
	}
	.table-container {
		max-height: 500px;
		overflow-y: auto;
		.fullwidth-table {
			width: 100%;
		}
	}
</style>
