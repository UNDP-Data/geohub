<script lang="ts">
	import { ModalTemplate, Notification } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let id: string;
	export let name: string;

	export let dialogShown = false;

	$: if (dialogShown) {
		openDeleteDialog();
	}

	let deletedDatasetName = '';
	let isDeleting = false;

	const handleDeleteDataset = async () => {
		try {
			isDeleting = true;

			const res = await fetch(`/api/datasets/${id}`, {
				method: 'DELETE'
			});
			if (res.ok && res.status === 204) {
				dispatch('deleted', {
					id,
					name
				});
				closeDeleteDialog();
			}
		} finally {
			isDeleting = false;
		}
	};

	const openDeleteDialog = () => {
		dialogShown = true;
		deletedDatasetName = '';
		disableScroll();
	};

	const closeDeleteDialog = () => {
		dialogShown = false;
		deletedDatasetName = '';
		enableScroll();
	};

	const disableScroll = () => {
		const root = document.documentElement;
		root.classList.add('is-clipped');
	};

	const enableScroll = () => {
		const root = document.documentElement;
		root.classList.remove('is-clipped');
	};
</script>

{#if dialogShown}
	<ModalTemplate title="Are you sure deleting the dataset?" bind:show={dialogShown}>
		<div slot="content">
			<div class="is-size-6 has-text-weight-normal">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2">
					This action <b>cannot</b> be undone. This will delete
					<b>{name}</b>
					from GeoHub data catalogue. It will not be searchable again from Data tab in GeoHub app.
					<br />
					Please type <b>{name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedDatasetName} />
			</div>
		</div>
		<div slot="buttons">
			<button
				class="button is-primary {isDeleting ? 'is-loading' : ''} is-uppercase has-text-weight-bold"
				on:click={handleDeleteDataset}
				disabled={deletedDatasetName !== name}
			>
				delete this dataset
			</button>
		</div>
	</ModalTemplate>
{/if}
