<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Stac, StacCatalog } from '$lib/types';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import {
		HeroHeader,
		ModalTemplate,
		Notification,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { PageData } from './$types';

	export let data: PageData;

	let showRegisterDialog = false;
	let isRegistering = false;

	let registerStac: Stac = {
		id: '',
		name: '',
		url: '',
		type: 'catalog',
		providers: []
	};
	let tempProviderName = '';

	let showDeleteDialog = false;
	let isDeleting = false;
	let deleteStacId: string;

	const resetRegisterForm = () => {
		registerStac = {
			id: '',
			name: '',
			url: '',
			type: 'catalog',
			providers: []
		};
		tempProviderName = '';
	};

	const handleClickDelete = async () => {
		isDeleting = true;

		try {
			const res = await fetch(`/api/stac/${deleteStacId}`, { method: 'DELETE' });
			if (res.ok) {
				toast.push(`${deleteStacId} was deleted successfully`);

				await invalidateAll();

				showDeleteDialog = false;
				deleteStacId = '';
			} else {
				toast.push(`${deleteStacId} was failed to delete`);
			}
		} finally {
			isDeleting = false;
		}
	};

	const handleAddProvider = () => {
		registerStac.providers = [...registerStac.providers, tempProviderName];
		tempProviderName = '';
	};

	const handleLoadStacUrl = async () => {
		if (!registerStac.url) return;
		const res = await fetch(registerStac.url);
		if (!res.ok) return;
		const stacCatalog: StacCatalog = await res.json();
		registerStac.id = stacCatalog.id;
		registerStac.name = stacCatalog.title ?? '';
	};

	const handleDeleteProvider = (provider: string) => {
		registerStac.providers = [...registerStac.providers.filter((p) => p !== provider)];
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: $page.url.href }
	];
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="body-section m-6">
	<div class="mb-4">
		<button
			class="button is-primary is-uppercase has-text-weight-bold"
			on:click={() => {
				resetRegisterForm();
				showRegisterDialog = true;
			}}>Register new STAC</button
		>
	</div>

	<table class="table is-bordered is-striped is-hoverable is-narrow is-fullwidth">
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Type</th>
				<th>STAC Catalog URL</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.stacs as stac}
				<tr>
					<td>
						<DefaultLink title={stac.id} href="/management/stac/{stac.type}/{stac.id}" target="" />
					</td>
					<td>{stac.name}</td>
					<td>{stac.type}</td>
					<td><CopyToClipboard value={stac.url} /></td>
					<td>
						<button
							class="button is-link {isDeleting ? 'is-loading' : ''}"
							disabled={isDeleting}
							type="button"
							on:click={() => {
								deleteStacId = stac.id;
								showDeleteDialog = true;
							}}
						>
							<span class="icon">
								<i class="fa-solid fa-trash" />
							</span>
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<ModalTemplate
	title="Register new STAC Catalog"
	bind:show={showRegisterDialog}
	hiddenButtons={true}
>
	<div slot="content">
		<form
			method="POST"
			action="?/register"
			use:enhance={({ cancel }) => {
				if (isRegistering) {
					cancel();
				}
				isRegistering = true;

				return async () => {
					await invalidateAll();
					resetRegisterForm();
					isRegistering = false;
					showRegisterDialog = false;
				};
			}}
		>
			<section class="register-form">
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">STAC URL</label>
					<div class="control has-icons-right">
						<input
							class="input {registerStac.url.length > 0 ? 'is-success' : 'is-danger'}"
							type="text"
							name="url"
							disabled={isRegistering}
							bind:value={registerStac.url}
						/>
						{#if registerStac.url}
							<span class="icon is-small is-right">
								<i class="fas fa-check has-text-success" />
							</span>
						{/if}
					</div>
					<p class="help is-danger">
						You can search STAC catalogs from <DefaultLink
							title="here"
							href="https://stacindex.org/catalogs"
							target="_blank"
						/>
					</p>
				</div>
				<button
					class="button is-uppercase has-text-weight-bold"
					type="button"
					disabled={!registerStac.url}
					on:click={handleLoadStacUrl}
				>
					Load metadata from STAC Server
				</button>

				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">STAC ID</label>
					<div class="control has-icons-right">
						<input
							class="input {registerStac.id.length > 0 ? 'is-success' : 'is-danger'}"
							type="text"
							name="id"
							disabled={isRegistering}
							bind:value={registerStac.id}
						/>
						{#if registerStac.id}
							<span class="icon is-small is-right">
								<i class="fas fa-check has-text-success" />
							</span>
						{/if}
					</div>
					{#if !registerStac.id}
						<p class="help is-danger">STAC ID is required</p>
					{/if}
				</div>
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">STAC name</label>
					<div class="control has-icons-right">
						<input
							class="input {registerStac.name.length > 0 ? 'is-success' : 'is-danger'}"
							type="text"
							name="name"
							disabled={isRegistering}
							bind:value={registerStac.name}
						/>
						{#if registerStac.name}
							<span class="icon is-small is-right">
								<i class="fas fa-check has-text-success" />
							</span>
						{/if}
					</div>
					{#if !registerStac.name}
						<p class="help is-danger">STAC name is required</p>
					{/if}
				</div>
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">STAC server type</label>
					<div class="control">
						<div class="select is-fullwidth">
							<select name="type" bind:value={registerStac.type}>
								<option value="api">API</option>
								<option value="catalog">Catalog</option>
							</select>
						</div>
						{#if registerStac.type === 'api'}
							<div class="p-2">
								<Notification showCloseButton={false} type="warning">
									In order to use STAC API server, you will also need to implement a class to handle
									this server.
								</Notification>
							</div>
						{/if}
					</div>
				</div>

				<div class="field" hidden={registerStac.type !== 'catalog'}>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Provider name</label>
					<div class="control">
						<div class="is-flex">
							<input
								class="input"
								type="text"
								disabled={isRegistering}
								bind:value={tempProviderName}
							/>
							<button
								class="ml-2 button is-link is-uppercase has-text-weight-bold"
								type="button"
								disabled={tempProviderName.length === 0}
								on:click={handleAddProvider}>Add</button
							>
						</div>
						<p class="help is-success">
							Please add data at least a provider's name for STAC Catalog
						</p>
						<table class="mt-2 table is-striped is-narrow is-hoverable is-fullwidth">
							<tbody>
								{#each registerStac.providers as provider}
									<tr>
										<td>
											<span>{provider}</span>
										</td>
										<td>
											<button
												class="delete"
												type="button"
												on:click={() => {
													handleDeleteProvider(provider);
												}}>Delete</button
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
						<input
							class="input"
							type="hidden"
							name="providers"
							value={JSON.stringify(registerStac.providers)}
						/>
					</div>
				</div>
			</section>

			<div class="pt-4">
				<button
					class="button is-primary is-uppercase has-text-weight-bold {isRegistering
						? 'is-loading'
						: ''}"
					disabled={isRegistering ||
						!(registerStac.id && registerStac.name && registerStac.url && registerStac.type)}
					type="submit"
				>
					Register
				</button>
			</div>
		</form>
	</div>
</ModalTemplate>

<ModalTemplate title="Are you sure deleting this STAC?" bind:show={showDeleteDialog}>
	<div slot="content">
		Are you sure to delete this STAC server <b>{deleteStacId}</b> from GeoHub?
	</div>
	<div slot="buttons">
		<button
			class="button is-primary is-upppercase has-text-weight-bold {isDeleting ? 'is-loading' : ''}"
			on:click={handleClickDelete}
			disabled={isDeleting}
			type="button"
		>
			Delete
		</button>
	</div>
</ModalTemplate>

<SvelteToast />

<style lang="scss">
	.body-section {
		min-height: 30vh;
	}

	.register-form {
		max-height: 350px;
		overflow-y: auto;
	}
</style>
