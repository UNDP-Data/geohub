<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Notification from '$components/util/Notification.svelte';
	import { AccepedExtensions } from '$lib/config/AppConfig';
	import { BlockBlobClient } from '@azure/storage-blob';
	import { TextInput, Checkbox, DefaultLink } from '@undp-data/svelte-undp-design';
	import JSZip from 'jszip';
	import { toast } from '@zerodevx/svelte-toast';
	import { filesize } from 'filesize';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import isValidFilename from 'valid-filename';
	import type { PageData } from './$types';
	import Time from 'svelte-time';
	import FieldControl from '$components/util/FieldControl.svelte';
	import Help from '$components/util/Help.svelte';

	const REDIRECT_TIME = 2000; // two second
	const FILE_SIZE_THRESHOLD = 104857600; // 100MB

	let no_show_extensions = AccepedExtensions.find(
		(ext) => ext.name === 'ESRI Shapefile'
	).extensions.map((ext) => ext.toLowerCase());

	no_show_extensions = no_show_extensions.filter((ext) => ext !== 'shp');
	no_show_extensions = no_show_extensions.filter((ext) => ext !== 'zip');

	no_show_extensions = [
		...no_show_extensions,
		...no_show_extensions.map((ext) => ext.toUpperCase())
	];
	export let data: PageData;
	let config = data.config;

	let selectedFile: File;
	let file: File;
	let selectedFiles: Array<File> = [];
	let selectedFileName: string;
	let shapefileValidityMapping: Record<string, string[]> = {};
	let uploadingFile: Promise<{ success: boolean }>;
	let uploadedLength = 0;
	let errorMessages = [];

	$: showErrorMessages = errorMessages.length > 0;
	$: progress = selectedFile ? (uploadedLength / selectedFile?.size) * 100 : 0;
	$: uploadDisabled = Object.keys(shapefileValidityMapping).length > 0 || selectedFiles.length < 1;
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

	const handleFilesSelect = async (e) => {
		selectedFile = undefined;
		let { acceptedFiles, fileRejections } = e.detail;
		if (fileRejections.length > 1) {
			errorMessages = [
				...errorMessages,
				'Some files could not be selected. Please ensure that the selected file has the correct extension.'
			];
			return;
		}
		if (acceptedFiles.length < 1) {
			errorMessages = [
				...errorMessages,
				'Some files could not be selected. Please ensure that the selected file has the correct extension.'
			];
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
			acceptedFiles = acceptedFiles.filter((file) => file.name.split('.').length > 1);
			selectedFiles = acceptedFiles;
			selectedFileName = `${selectedFiles[0].name.split('.').at(-2)}.zip`;
			selectedFile = await zipMultipleFiles(selectedFiles, selectedFileName);
		} else if (acceptedFiles.length === 1) {
			file = acceptedFiles[0];
			selectedFile = file;
			selectedFileName = selectedFile.name;
			selectedFiles = [file];
		} else {
			return;
		}
		shapefileValidityMapping = await checkShapefileIsValid(selectedFiles);
	};

	const zipMultipleFiles = async (files, fileName) => {
		const zip = new JSZip();
		files.forEach((file: File) => {
			zip.file(file.name, file);
		});
		const content = await zip.generateAsync({ type: 'blob' });
		return new File([content], `${fileName}`, { type: 'application/zip' });
	};

	const getZipFilesList = async (files: Array<File>) => {
		let zipFileList = [];
		const zipFiles = files.filter((file) => file.name.split('.').at(-1) === 'zip');
		const promises = zipFiles.map(async (zipFile) => {
			const jszip = new JSZip();
			return jszip.loadAsync(zipFile).then((zip) => {
				const zipEntryPromises = [];

				zip.forEach((relativePath, zipEntry) => {
					if (!zipEntry.dir) {
						zipEntryPromises.push(
							zipEntry.async('blob').then((blob) => {
								zipFileList.push({
									name: `${zipFile.name}/${zipEntry.name}`,
									path: `${zipFile.name}/${zipEntry.name}`,
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

			selectedFiles = [...selectedFiles, ...files];

			selectedFiles = await validateFileNames(files);
			if (selectedFiles.length > 1) {
				selectedFileName = `${selectedFiles[0].name.split('.').at(-2)}.zip`;
				selectedFile = await zipMultipleFiles(selectedFiles, selectedFileName);
			} else {
				selectedFileName = selectedFiles[0].name;
				selectedFile = selectedFiles[0];
			}
			shapefileValidityMapping = await checkShapefileIsValid(selectedFiles);
		};
	};

	const removeAllFiles = () => {
		selectedFiles = [];
		selectedFile = undefined;
		selectedFileName = '';
		errorMessages = [];
	};

	const removeFileWithPath = async (path: string) => {
		if (selectedFiles.length === 1) {
			removeAllFiles();
			return;
		}
		if (path.split('.').at(-1) === 'shp') {
			const filename = path.split('.').slice(0, -1).join('.');
			let otherShapefileFiles = no_show_extensions.map((ext) => `${filename}.${ext}`);
			otherShapefileFiles = [...otherShapefileFiles, path];
			selectedFiles = selectedFiles.filter((file) => !otherShapefileFiles.includes(file.name));
		} else {
			selectedFiles = selectedFiles.filter((file) => file.path !== path);
			shapefileValidityMapping = await checkShapefileIsValid(selectedFiles);
		}
	};

	const checkShapefileIsValid = async (fileList: Array<File>) => {
		const zipFiles = fileList.filter((file) => file.name.split('.').at(-1) === 'zip');
		const nonZipFiles = fileList.filter((file) => file.name.split('.').at(-1) !== 'zip');
		const zipFilesList = await getZipFilesList(zipFiles);
		fileList = [...nonZipFiles, ...zipFilesList];
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
</script>

{#if !data.session}
	<Notification type="warning" showCloseButton={false}>
		You have not signed in to GeoHub yet. To upload your dataset, please sign in to GeoHub first.
	</Notification>
{:else}
	<div class="column m-4 m-auto is-four-fifths py-5 has-content-centered">
		<p class="title is-4 has-text-centered">Upload your datasets</p>
		<Dropzone
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
					<button class="file-cta has-background-grey" on:click={openFilePick}>
						<span class="file-label has-text-white"> Select files </span>
					</button>
				</label>
			</div>
		</Dropzone>
		<div class="mt-2 ml-2">
			<span>
				To read about supported file formats in GeoHub,
				<DefaultLink title="click here" href="/data/supported-formats" />
			</span>
		</div>
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
				{#if selectedFiles.length > 0}
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
								{@const path = file.name}
								{@const filename = path.split('.').at(-2)}
								{@const extension = path.split('.').at(-1)}
								<tr style="display: {no_show_extensions.includes(extension) ? 'None' : ''}">
									<td>
										<div class="column is-multiline pb-0">
											<span>{extension === 'shp' ? path.split('.').at(-2) : path}</span>
											{#if Object.keys(shapefileValidityMapping).length > 0}
												{#if path.split('.').pop() === 'shp'}
													{#if shapefileValidityMapping[filename]}
														<span class="tag is-danger is-light has-text-danger">
															<small>Missing: {shapefileValidityMapping[filename]}</small>
														</span>
													{/if}
												{:else if path.split('.').pop() === 'zip'}
													{@const mappingKey = Object.keys(shapefileValidityMapping).find((key) =>
														key.startsWith(path)
													)}
													{#if mappingKey}
														<span class="tag is-danger is-light has-text-danger">
															<small>Missing: {shapefileValidityMapping[mappingKey]}</small>
														</span>
													{/if}
												{/if}
											{/if}
										</div>
										<div class="column is-multiline pt-0">
											{#each ['shp', 'shx', 'prj', 'dbf'] as ext}
												{#if extension === 'shp'}
													{#if selectedFiles.find((file) => file.name === `${filename}.${ext}`)}
														<span
															style="display: {extension !== 'shp' ? 'None' : ''}"
															class="tag mr-1 is-info is-light">{ext}</span
														>
													{/if}
												{/if}
											{/each}
										</div>
									</td>
									<td>{(file.size / 1000000).toFixed(3)}MB</td>
									<td><Time timestamp={file.lastModified} format="h:mm A, MMMM D, YYYY" /></td>
									<td><button on:click={() => removeFileWithPath(path)} class="delete"></button></td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<div class="column control is-flex is-flex is-justify-content-flex-end">
				<button on:click={removeAllFiles} disabled={selectedFiles.length < 1} class="button is-link"
					>Clear Selected</button
				>
			</div>
		{/if}

		<div class="label is-normal is-flex is-align-items-center mt-5">
			<div class="ml-2 help">
				<Checkbox
					on:clicked={() =>
						(config.DataPageIngestingJoinVectorTiles = !config.DataPageIngestingJoinVectorTiles)}
					checked={!config.DataPageIngestingJoinVectorTiles}
					label="Every layer (Point, Line, Polygon) into into its own file"
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
				<div class="pl-0 control column is-one-fifth">
					<button class="button is-large is-primary" disabled={uploadDisabled} type="submit">
						<span class="icon">
							<i class="fa-solid fa-cloud-arrow-up" />
						</span>
						<span>Upload</span>
					</button>
				</div>
			</form>
		</div>

		{#await uploadingFile}
			<progress class="progress is-success" value={progress} max="100">{progress}%</progress>
			<p>{filesize(uploadedLength, { round: 1 })} / {filesize(selectedFile?.size, { round: 1 })}</p>
		{/await}
		{#if showErrorMessages}
			{#each errorMessages as message}
				<Notification
					type="danger"
					on:close={() => {
						errorMessages = errorMessages.filter((msg) => msg !== message);
					}}
				>
					There was an error selecting the file.
					<span>{message}</span>
				</Notification>
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
{/if}

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
