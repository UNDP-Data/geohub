<script lang="ts">
	import { Permission } from '$lib/config/AppConfig';
	import { handleEnterKey, initTippy, removeSasTokenFromDatasetUrl } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import PublishedDatasetDeleteDialog from './PublishedDatasetDeleteDialog.svelte';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;

	let isStac = feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac' ?? false;

	let confirmDeleteDialogVisible = false;

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: false,
		theme: 'transparent',
		offset: [10, 0],
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	const getEditMetadataPage = (url: string) => {
		const url4edit = removeSasTokenFromDatasetUrl(url);
		return `/data/${feature.properties.id}/edit?url=${url4edit}`;
	};

	const handleDeleteDataset = async () => {
		dispatch('deleted', {
			feature
		});
	};

	const clickMenuButton = () => {
		const buttons = document.getElementsByClassName(`menu-button-${feature.properties.id}`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const button: HTMLButtonElement = buttons[0];
		button.click();
	};
</script>

{#if feature.properties.permission && feature.properties.permission >= Permission.READ}
	<div class="dropdown-trigger">
		<button
			class="button menu-button menu-button-{feature.properties.id}"
			use:tippy={{ content: tooltipContent }}
			disabled={!(
				feature.properties.permission && feature.properties.permission >= Permission.READ
			)}
		>
			<span class="icon is-small">
				<i class="fas fa-ellipsis-vertical" aria-hidden="true"></i>
			</span>
		</button>
	</div>
	<div class="tooltip" role="menu" bind:this={tooltipContent}>
		<div class="dropdown-content">
			{#if !isStac && feature.properties.permission > Permission.READ}
				<a class="dropdown-item" role="button" href={getEditMetadataPage(feature.properties.url)}>
					<span class="icon">
						<i class="fa-solid fa-pen-to-square" />
					</span>
					<span>Edit</span>
				</a>
				<a
					class="dropdown-item"
					role="button"
					tabindex="0"
					href="/data/{feature.properties.id}/style/edit"
				>
					<span class="icon">
						<i class="fa-solid fa-paintbrush"></i>
					</span>
					<span>Set default style</span>
				</a>
			{/if}
			{#if feature.properties.permission >= Permission.READ && !isStac}
				<a
					class="dropdown-item"
					role="button"
					tabindex="0"
					href="/data/{feature.properties.id}/permission"
				>
					<span class="icon">
						<i class="fa-solid fa-user-lock"></i>
					</span>
					<span>Set user permission</span>
				</a>
			{/if}
			{#if feature.properties.permission > Permission.WRITE}
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="dropdown-item"
					role="button"
					tabindex="0"
					data-sveltekit-preload-code="off"
					data-sveltekit-preload-data="off"
					on:click={() => {
						clickMenuButton();
						confirmDeleteDialogVisible = true;
					}}
					on:keydown={handleEnterKey}
				>
					<span class="icon">
						<i class="fa-solid fa-trash" />
					</span>
					<span>Unpublish</span>
				</a>
			{/if}
		</div>
	</div>
{/if}

<PublishedDatasetDeleteDialog
	bind:id={feature.properties.id}
	bind:name={feature.properties.name}
	bind:dialogShown={confirmDeleteDialogVisible}
	on:deleted={handleDeleteDataset}
/>

<style lang="scss">
	.menu-button {
		border: none;
		background: transparent;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
