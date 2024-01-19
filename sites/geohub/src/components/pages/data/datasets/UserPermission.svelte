<script lang="ts">
	import { page } from '$app/stores';
	import FieldControl from '$components/util/FieldControl.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import type { DatasetPermission } from '$lib/server/DatasetPermissionManager';
	import type { DatasetFeature } from '$lib/types';
	import { handleEnterKey } from '@undp-data/svelte-geohub-static-image-controls';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';
	import { fade } from 'svelte/transition';

	export let dataset: DatasetFeature;

	let permissions: DatasetPermission[] = [];

	let isUpadating = false;
	let showEditDialog = false;
	let showAddDialog = false;
	let showDeleteDialog = false;
	let targetUserPermission: DatasetPermission;
	let errorMessage = '';

	let signedInUser = $page.data.session.user;

	let user_email = '';
	let user_permission: Permission;
	let isSendMessage = true;
	let messageBody = '';

	$: user_email, validateEmail(user_email);
	let isValidEmail = false;
	let existUser = false;

	const getUserPermissions = async () => {
		const res = await fetch(`/api/datasets/${dataset.properties.id}/permission`);
		permissions = await res.json();
	};

	const getPermissionLabel = (permission: Permission) => {
		let label = '';
		switch (permission) {
			case Permission.OWNER:
				label = 'owner';
				break;
			case Permission.WRITE:
				label = 'editor';
				break;
			case Permission.READ:
				label = 'viewer';
				break;
			default:
				label = 'unknown';
				break;
		}
		return label;
	};

	const getSingedInUserPermission = () => {
		const currentUserPermission = permissions.find(
			(p) => p.user_email === signedInUser.email
		)?.permission;
		return signedInUser.is_superuser ? Permission.OWNER : currentUserPermission;
	};

	const getPermissionList = () => {
		const currentUserPermission = getSingedInUserPermission();
		if (currentUserPermission === Permission.OWNER) {
			return [Permission.READ, Permission.WRITE, Permission.OWNER];
		} else if (currentUserPermission === Permission.WRITE) {
			return [Permission.READ, Permission.WRITE];
		} else {
			return [Permission.READ];
		}
	};

	const handleOpenAddOrEditDialog = (isAdd = true) => {
		showAddDialog = false;
		showEditDialog = false;
		showDeleteDialog = false;
		errorMessage = '';

		user_email = '';
		user_permission = isAdd ? Permission.READ : targetUserPermission.permission;
		isSendMessage = true;
		if (isAdd) {
			messageBody = `I am inviting you to the dataset (${dataset.properties.name}) at UNDP GeoHub. 
The dataset can be accessed at ${$page.url.origin}/data/${dataset.properties.id}

Regards,
${signedInUser.name}`;
			showAddDialog = true;
		} else {
			messageBody = `I changed your permission to the dataset (${dataset.properties.name}) at UNDP GeoHub. 
The dataset can be accessed at ${$page.url.origin}/data/${dataset.properties.id}

Regards,
${signedInUser.name}`;
			showEditDialog = true;
		}
	};

	const handleOpenDeleteDialog = (datasetPermission: DatasetPermission) => {
		showAddDialog = false;
		showEditDialog = false;
		targetUserPermission = datasetPermission;
		errorMessage = '';
		showDeleteDialog = true;
	};

	const handleAddPermission = async () => {
		try {
			isUpadating = true;

			const body = {
				dataset_id: dataset.properties.id,
				user_email: user_email,
				permission: user_permission
			};

			const res = await fetch(`/api/datasets/${dataset.properties.id}/permission`, {
				method: 'POST',
				body: JSON.stringify(body)
			});
			if (res.ok) {
				await getUserPermissions();
				showAddDialog = false;
			} else {
				const err = await res.json();
				errorMessage = err.message;
			}
		} finally {
			isUpadating = false;
		}
	};

	const handleEditPermission = async () => {
		try {
			isUpadating = true;

			const body = {
				dataset_id: targetUserPermission.dataset_id,
				user_email: targetUserPermission.user_email,
				permission: user_permission,
				createdat: targetUserPermission.createdat
			};

			const res = await fetch(`/api/datasets/${dataset.properties.id}/permission`, {
				method: 'PUT',
				body: JSON.stringify(body)
			});
			if (res.ok) {
				await getUserPermissions();
				showEditDialog = false;
			} else {
				const err = await res.json();
				errorMessage = err.message;
			}
		} finally {
			isUpadating = false;
		}
	};

	const handleDeletePermission = async () => {
		try {
			isUpadating = true;

			const res = await fetch(
				`/api/datasets/${dataset.properties.id}/permission?user_email=${targetUserPermission.user_email}`,
				{
					method: 'DELETE'
				}
			);
			if (res.ok) {
				await getUserPermissions();
				showDeleteDialog = false;
			} else {
				const err = await res.json();
				errorMessage = err.message;
			}
		} finally {
			isUpadating = false;
		}
	};

	const validateEmail = debounce((email: string) => {
		if (!email) return false;
		const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
		existUser = permissions.find((p) => p.user_email === email) ? true : false;
		isValidEmail = email.match(validRegex) ? (existUser ? false : true) : false;
	}, 300);

	onMount(async () => {
		await getUserPermissions();
	});
</script>

<div class="table-container mt-2">
	{#if permissions.length === 0}
		<div class="is-flex is-justify-content-center">
			<Loader size="medium" />
		</div>
	{:else}
		{@const siginedUserPermission = getSingedInUserPermission()}
		<table class="permission-table table is-hoverable is-fullwidth mb-2">
			<thead>
				<tr>
					<th class="email">Email</th>
					<th class="permission">Permission</th>
					<th class="lastmodified">Last modified</th>
					<th class="operations"></th>
				</tr>
			</thead>
			<tbody>
				{#each permissions as permission}
					<tr class="border-bottom">
						<td class="email">
							{permission.user_email}
							{#if permission.user_email === signedInUser.email}
								(you)
							{/if}
						</td>
						<td class="permission">
							<p class="is-capitalized">
								{getPermissionLabel(permission.permission)}
							</p>
						</td>
						<td class="lastmodified">
							{#if permission.updatedat}
								<Time timestamp={permission.updatedat} format="HH:mm, MM/DD/YYYY" />
							{:else}
								<Time timestamp={permission.createdat} format="HH:mm, MM/DD/YYYY" />
							{/if}
						</td>
						<td class="operations py-0">
							{#if permission.user_email !== signedInUser.email}
								{#if permissions.filter((p) => p.permission === Permission.OWNER && p.user_email !== permission.user_email)?.length > 0}
									{#if permission.permission <= siginedUserPermission}
										<p class="is-flex">
											<button
												class="operation-button button py-0"
												on:click={() => {
													targetUserPermission = permission;
													handleOpenAddOrEditDialog(false);
												}}
												disabled={siginedUserPermission === Permission.READ &&
													permission.permission === Permission.READ}
											>
												<span class="icon is-small">
													<i class="fa-solid fa-pen"></i>
												</span>
											</button>

											<button
												class="operation-button button py-0"
												on:click={() => {
													handleOpenDeleteDialog(permission);
												}}
											>
												<span class="icon is-small">
													<i class="fa-solid fa-trash"></i>
												</span>
											</button>
										</p>
									{/if}
								{/if}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<button
			class="button is-primary is-uppercase has-text-weight-bold"
			on:click={() => {
				handleOpenAddOrEditDialog(true);
			}}>Add user</button
		>
	{/if}
</div>

{#if showAddDialog}
	<div class="modal {showAddDialog ? 'is-active' : ''}" transition:fade|global>
		<div
			class="modal-background"
			role="none"
			on:click={() => {
				showAddDialog = false;
			}}
			on:keydown={handleEnterKey}
		/>

		<div class="modal-card">
			<section class="modal-card-body">
				<button
					class="delete is-large"
					aria-label="close"
					title="Close"
					on:click={() => {
						showAddDialog = false;
					}}
				/>
				<p class="title is-5">Add User</p>
				<FieldControl title="email address" showHelp={false}>
					<div slot="control">
						<div class="control has-icons-left has-icons-right">
							<input
								class="input {!isValidEmail ? 'is-danger' : 'is-success'}"
								type="email"
								bind:value={user_email}
							/>
							<span class="icon is-small is-left">
								<i class="fas fa-envelope"></i>
							</span>
							{#if isValidEmail}
								<span class="icon is-small is-right">
									<i class="fas fa-check"></i>
								</span>
							{/if}
						</div>
						{#key existUser}
							{#if existUser}
								<p class="help is-danger">This email was already registered.</p>
							{/if}
						{/key}
					</div>
				</FieldControl>

				<FieldControl title="specify role" showHelp={false}>
					<div class="select is-fullwidth" slot="control">
						<select class="is-capitalized" bind:value={user_permission}>
							{#each getPermissionList() as p}
								<option value={p}>{getPermissionLabel(p)}</option>
							{/each}
						</select>
					</div>
				</FieldControl>

				<!-- <div class="mb-2"><Checkbox label="Send a message" bind:checked={isSendMessage} /></div>

				{#if isSendMessage}
					<FieldControl title="add a message" showHelp={false}>
						<div slot="control">
							<textarea
								class="textarea has-fixed-size"
								placeholder="Add a message to user"
								bind:value={messageBody}
							></textarea>
						</div>
					</FieldControl>
				{/if}
				{#if errorMessage}
					<Notification type="danger" showCloseButton={false}>{errorMessage}</Notification>
				{/if} -->

				<button
					class="button is-primary is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} "
					disabled={!(
						isValidEmail &&
						(!isSendMessage || (isSendMessage && messageBody.length > 0))
					)}
					on:click={handleAddPermission}
				>
					Add
				</button>
			</section>
		</div>
	</div>
{/if}

{#if showEditDialog}
	<div class="modal {showEditDialog ? 'is-active' : ''}" transition:fade|global>
		<div
			class="modal-background"
			role="none"
			on:click={() => {
				showEditDialog = false;
			}}
			on:keydown={handleEnterKey}
		/>

		<div class="modal-card">
			<section class="modal-card-body">
				<button
					class="delete is-large"
					aria-label="close"
					title="Close"
					on:click={() => {
						showEditDialog = false;
					}}
				/>
				<p class="title is-5">Edit User</p>
				<FieldControl title="email address" showHelp={false}>
					<div class="control has-icons-left" slot="control">
						<input
							class="input"
							type="email"
							bind:value={targetUserPermission.user_email}
							readonly
						/>
						<span class="icon is-small is-left">
							<i class="fas fa-envelope"></i>
						</span>
					</div>
				</FieldControl>

				<FieldControl title="specify role" showHelp={false}>
					<div class="select is-fullwidth" slot="control">
						<select class="is-capitalized" bind:value={user_permission}>
							{#each getPermissionList() as p}
								<option value={p}>{getPermissionLabel(p)}</option>
							{/each}
						</select>
					</div>
				</FieldControl>

				<!-- <div class="mb-2"><Checkbox label="Send a message" bind:checked={isSendMessage} /></div>

				{#if isSendMessage}
					<FieldControl title="add a message" showHelp={false}>
						<div slot="control">
							<textarea
								class="textarea has-fixed-size"
								placeholder="Add a message to user"
								bind:value={messageBody}
							></textarea>
						</div>
					</FieldControl>
				{/if}
				{#if errorMessage}
					<Notification type="danger" showCloseButton={false}>{errorMessage}</Notification>
				{/if} -->

				<button
					class="button is-primary is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} "
					disabled={!(
						(!isSendMessage || (isSendMessage && messageBody.length > 0)) &&
						permissions.find((p) => p.user_email === targetUserPermission.user_email)
							?.permission !== user_permission
					)}
					on:click={handleEditPermission}
				>
					Edit
				</button>
			</section>
		</div>
	</div>
{/if}

{#if showDeleteDialog}
	<div class="modal {showDeleteDialog ? 'is-active' : ''}" transition:fade|global>
		<div
			class="modal-background"
			role="none"
			on:click={() => {
				showDeleteDialog = false;
			}}
			on:keydown={handleEnterKey}
		/>
		<div class="modal-card">
			<section class="modal-card-body">
				<button
					class="delete is-large"
					aria-label="close"
					title="Close"
					on:click={() => {
						showDeleteDialog = false;
					}}
				/>
				<p class="title is-5">Are you sure deleting this user's permission?</p>
				<div class="has-text-weight-medium">
					This action <b>cannot</b> be undone.
					<br />
					This will delete
					<b>{targetUserPermission?.user_email}</b>'s permission from this dataset of {dataset
						.properties.name}.
				</div>
				{#if errorMessage}
					<Notification type="danger" showCloseButton={false}>{errorMessage}</Notification>
				{/if}

				<button
					class="button is-primary is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} mt-2"
					on:click={handleDeletePermission}
				>
					delete this user
				</button>
			</section>
		</div>
	</div>
{/if}

<style lang="scss">
	.border-bottom {
		border-bottom: 1px solid #d4d6d8;
	}

	.permission-table {
		.email {
			width: 100%;
		}
		.permission {
			min-width: 80px;
		}
		.lastmodified {
			min-width: 150px;
		}
		.operations {
			min-width: 100px;
		}
	}

	.operation-button {
		border: none;
		background: transparent;
	}

	.modal-card {
		.modal-card-body {
			.delete {
				position: absolute;
				top: 1rem;
				right: 1rem;
			}
		}
	}
</style>
