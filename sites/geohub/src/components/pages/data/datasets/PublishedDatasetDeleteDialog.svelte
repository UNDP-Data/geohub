<script lang="ts">
	import { ModalTemplate, Notification } from '@undp-data/svelte-undp-components';

	interface Props {
		id: string;
		name: string;
		dialogShown?: boolean;
		ondelete?: () => void;
	}

	let {
		id = $bindable(),
		name = $bindable(),
		dialogShown = $bindable(false),
		ondelete = () => {}
	}: Props = $props();

	let deletedDatasetName = $state('');
	let isDeleting = $state(false);

	const handleDeleteDataset = async () => {
		try {
			isDeleting = true;

			const res = await fetch(`/api/datasets/${id}`, {
				method: 'DELETE'
			});
			if (res.ok && res.status === 204) {
				if (ondelete) {
					ondelete();
				}
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
	$effect(() => {
		if (dialogShown === true) {
			openDeleteDialog();
		}
	});
</script>

{#if dialogShown}
	<ModalTemplate title="Are you sure deleting the dataset?" bind:show={dialogShown}>
		{#snippet content()}
			<div>
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
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-primary {isDeleting
						? 'is-loading'
						: ''} is-uppercase has-text-weight-bold"
					onclick={handleDeleteDataset}
					disabled={deletedDatasetName !== name}
				>
					delete this dataset
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}
