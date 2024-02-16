<script context="module" lang="ts">
	/**
	 * UserPermissionAPIBase interface
	 * it is a base abstract class to operation permission API. Actually implementation will be done at a class.
	 */
	export interface UserPermissionAPIBase {
		/**
		 * get all permissions
		 */
		getAlls: () => Promise<DatasetPermission[] | StylePermission[]>;

		/**
		 * add permission
		 * @param user_email user email address
		 * @param permission 1: read, 2: write, 3: owner
		 */
		add: (user_email: string, permission: Permission) => Promise<Response>;

		/**
		 * edit permission
		 * @param target target user's permission object
		 * @param permission 1: read, 2: write, 3: owner
		 */
		edit: (
			target: DatasetPermission | StylePermission,
			permission: Permission
		) => Promise<Response>;

		/**
		 * delete permission
		 * @param target target user's permission object
		 */
		delete: (target: DatasetPermission | StylePermission) => Promise<Response>;

		/**
		 * get message body for adding permission
		 * @param url should specify $page.url object
		 * @param username user name
		 */
		getAddMessageBody: (url: URL, username: string) => string;

		/**
		 * get message body for editing permission
		 * @param url should specify $page.url object
		 * @param username user name
		 */
		getModifyMessageBody: (url: URL, username: string) => string;

		/**
		 * get name of target
		 */
		getName: () => string;
	}

	export class DatasetPermissionAPI implements UserPermissionAPIBase {
		private dataset: DatasetFeature;

		constructor(dataset: DatasetFeature) {
			this.dataset = dataset;
		}

		public getAlls = async () => {
			const res = await fetch(`/api/datasets/${this.dataset.properties.id}/permission`);
			const permissions: DatasetPermission[] = await res.json();
			return permissions;
		};

		public add = async (user_email: string, permission: Permission) => {
			const body = {
				dataset_id: this.dataset.properties.id,
				user_email: user_email,
				permission: permission
			};

			const res = await fetch(`/api/datasets/${this.dataset.properties.id}/permission`, {
				method: 'POST',
				body: JSON.stringify(body)
			});
			return res;
		};

		public edit = async (target: DatasetPermission, permission: Permission) => {
			const body = {
				dataset_id: target.dataset_id,
				user_email: target.user_email,
				permission: permission,
				createdat: target.createdat
			};

			const res = await fetch(`/api/datasets/${this.dataset.properties.id}/permission`, {
				method: 'PUT',
				body: JSON.stringify(body)
			});
			return res;
		};

		public delete = async (target: DatasetPermission) => {
			const res = await fetch(
				`/api/datasets/${target.dataset_id}/permission?user_email=${target.user_email}`,
				{
					method: 'DELETE'
				}
			);
			return res;
		};

		public getAddMessageBody = (url: URL, username: string) => {
			return `I am inviting you to the dataset (${this.dataset.properties.name}) at UNDP GeoHub. 
The dataset can be accessed at ${url.origin}/data/${this.dataset.properties.id}

Regards,
${username}`;
		};

		public getModifyMessageBody = (url: URL, username: string) => {
			return `I changed your permission to the dataset (${this.dataset.properties.name}) at UNDP GeoHub. 
The dataset can be accessed at ${url.origin}/data/${this.dataset.properties.id}

Regards,
${username}`;
		};

		public getName = () => {
			return this.dataset.properties.name;
		};
	}

	export class StylePermissionAPI implements UserPermissionAPIBase {
		private style: DashboardMapStyle;

		constructor(style: DashboardMapStyle) {
			this.style = style;
		}

		public getAlls = async () => {
			const res = await fetch(`/api/style/${this.style.id}/permission`);
			const permissions: StylePermission[] = await res.json();
			return permissions;
		};

		public add = async (user_email: string, permission: Permission) => {
			const body = {
				style_id: this.style.id,
				user_email: user_email,
				permission: permission
			};

			const res = await fetch(`/api/style/${this.style.id}/permission`, {
				method: 'POST',
				body: JSON.stringify(body)
			});
			return res;
		};

		public edit = async (target: StylePermission, permission: Permission) => {
			const body = {
				style_id: target.style_id,
				user_email: target.user_email,
				permission: permission,
				createdat: target.createdat
			};

			const res = await fetch(`/api/style/${this.style.id}/permission`, {
				method: 'PUT',
				body: JSON.stringify(body)
			});
			return res;
		};

		public delete = async (target: StylePermission) => {
			const res = await fetch(
				`/api/style/${target.style_id}/permission?user_email=${target.user_email}`,
				{
					method: 'DELETE'
				}
			);
			return res;
		};

		public getAddMessageBody = (url: URL, username: string) => {
			return `I am inviting you to the map (${this.style.name}) at UNDP GeoHub. 
The map can be accessed at ${url.origin}/maps/${this.style.id}

Regards,
${username}`;
		};

		public getModifyMessageBody = (url: URL, username: string) => {
			return `I changed your permission to the map (${this.style.name}) at UNDP GeoHub. 
The map can be accessed at ${url.origin}/data/${this.style.id}

Regards,
${username}`;
		};

		public getName = () => {
			return this.style.name;
		};
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import FieldControl from '$components/util/FieldControl.svelte';
	import ModalTemplate from '$components/util/ModalTemplate.svelte';
	import Notification from '$components/util/Notification.svelte';
	import { Permission } from '$lib/config/AppConfig';
	import type { DatasetPermission } from '$lib/server/DatasetPermissionManager';
	import type { StylePermission } from '$lib/server/StylePermissionManager.ts';
	import type { DashboardMapStyle, DatasetFeature } from '$lib/types';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/src/Time.svelte';

	export let api: UserPermissionAPIBase;

	let permissions: DatasetPermission[] | StylePermission[] = [];

	let isUpadating = false;
	let showEditDialog = false;
	let showAddDialog = false;
	let showDeleteDialog = false;
	let targetUserPermission: DatasetPermission | StylePermission;
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
		permissions = await api.getAlls();
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
			messageBody = api.getAddMessageBody($page.url, signedInUser.name);
			showAddDialog = true;
		} else {
			messageBody = api.getModifyMessageBody($page.url, signedInUser.name);
			showEditDialog = true;
		}
	};

	const handleOpenDeleteDialog = (permission: DatasetPermission | StylePermission) => {
		showAddDialog = false;
		showEditDialog = false;
		targetUserPermission = permission;
		errorMessage = '';
		showDeleteDialog = true;
	};

	const handleAddPermission = async () => {
		try {
			isUpadating = true;

			const res = await api.add(user_email, user_permission);
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
			const res = await api.edit(targetUserPermission, user_permission);
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

			const res = await api.delete(targetUserPermission);
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
		<p class="is-size-6 has-text-weight-bold is-capitalized mb-1">authorized users</p>

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
	<ModalTemplate title="Add User" bind:show={showAddDialog}>
		<div slot="content">
			<FieldControl title="email address" showHelp={false}>
				<div slot="control">
					<div class="control has-icons-left has-icons-right">
						<input
							class="input {!isValidEmail ? 'is-danger' : 'is-success'}"
							type="email"
							bind:value={user_email}
							disabled={isUpadating}
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
					<select class="is-capitalized" bind:value={user_permission} disabled={isUpadating}>
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
		</div>
		<div slot="buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isUpadating
					? 'is-loading'
					: ''} "
				disabled={!(isValidEmail && (!isSendMessage || (isSendMessage && messageBody.length > 0)))}
				on:click={handleAddPermission}
			>
				Add
			</button>
		</div>
	</ModalTemplate>
{/if}

{#if showEditDialog}
	<ModalTemplate title="Edit User" bind:show={showEditDialog}>
		<div slot="content">
			<FieldControl title="email address" showHelp={false}>
				<div class="control has-icons-left" slot="control">
					<input class="input" type="email" bind:value={targetUserPermission.user_email} readonly />
					<span class="icon is-small is-left">
						<i class="fas fa-envelope"></i>
					</span>
				</div>
			</FieldControl>

			<FieldControl title="specify role" showHelp={false}>
				<div class="select is-fullwidth" slot="control">
					<select class="is-capitalized" bind:value={user_permission} disabled={isUpadating}>
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
		</div>
		<div slot="buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isUpadating
					? 'is-loading'
					: ''} "
				disabled={!(
					(!isSendMessage || (isSendMessage && messageBody.length > 0)) &&
					permissions.find((p) => p.user_email === targetUserPermission.user_email)?.permission !==
						user_permission
				)}
				on:click={handleEditPermission}
			>
				Edit
			</button>
		</div>
	</ModalTemplate>
{/if}

{#if showDeleteDialog}
	<ModalTemplate title="Are you sure deleting this user's permission?" bind:show={showDeleteDialog}>
		<div slot="content">
			<div class="has-text-weight-medium">
				This action <b>cannot</b> be undone.
				<br />
				This will delete
				<b>{targetUserPermission?.user_email}</b>'s permission from {api.getName()}.
			</div>
			{#if errorMessage}
				<Notification type="danger" showCloseButton={false}>{errorMessage}</Notification>
			{/if}
		</div>
		<div slot="buttons">
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isUpadating
					? 'is-loading'
					: ''} mt-2"
				on:click={handleDeletePermission}
			>
				delete this user
			</button>
		</div>
	</ModalTemplate>
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
</style>
