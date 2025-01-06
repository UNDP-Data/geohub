<script module lang="ts">
	/**
	 * UserPermissionAPIBase interface
	 * it is a base abstract class to operation permission API. Actually implementation will be done at a class.
	 */
	export interface UserPermissionAPIBase {
		/**
		 * get all permissions
		 */
		getAlls: () => Promise<DatasetPermission[] | StylePermission[] | StorymapPermission[]>;

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
			target: DatasetPermission | StylePermission | StorymapPermission,
			permission: Permission
		) => Promise<Response>;

		/**
		 * delete permission
		 * @param target target user's permission object
		 */
		delete: (target: DatasetPermission | StylePermission | StorymapPermission) => Promise<Response>;

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

		public edit = async (
			target: DatasetPermission | StylePermission | StorymapPermission,
			permission: Permission
		) => {
			const body = {
				dataset_id: (target as DatasetPermission).dataset_id,
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

		public delete = async (target: DatasetPermission | StylePermission | StorymapPermission) => {
			const res = await fetch(
				`/api/datasets/${(target as DatasetPermission).dataset_id}/permission?user_email=${target.user_email}`,
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
			return this.dataset.properties.name as string;
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

		public edit = async (
			target: DatasetPermission | StylePermission | StorymapPermission,
			permission: Permission
		) => {
			const body = {
				style_id: (target as StylePermission).style_id,
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

		public delete = async (target: DatasetPermission | StylePermission | StorymapPermission) => {
			const res = await fetch(
				`/api/style/${(target as StylePermission).style_id}/permission?user_email=${target.user_email}`,
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

	export class StorymapPermissionAPI implements UserPermissionAPIBase {
		private storymap: StoryMapConfig;

		constructor(storymap: StoryMapConfig) {
			this.storymap = storymap;
		}

		public getAlls = async () => {
			const res = await fetch(`/api/storymaps/${this.storymap.id}/permission`);
			const permissions: StorymapPermission[] = await res.json();
			return permissions;
		};

		public add = async (user_email: string, permission: Permission) => {
			const body = {
				storymap_id: this.storymap.id,
				user_email: user_email,
				permission: permission
			};

			const res = await fetch(`/api/storymaps/${this.storymap.id}/permission`, {
				method: 'POST',
				body: JSON.stringify(body)
			});
			return res;
		};

		public edit = async (
			target: DatasetPermission | StylePermission | StorymapPermission,
			permission: Permission
		) => {
			const body = {
				storymap_id: (target as StorymapPermission).storymap_id,
				user_email: target.user_email,
				permission: permission,
				createdat: target.createdat
			};

			const res = await fetch(`/api/storymaps/${this.storymap.id}/permission`, {
				method: 'PUT',
				body: JSON.stringify(body)
			});
			return res;
		};

		public delete = async (target: DatasetPermission | StylePermission | StorymapPermission) => {
			const res = await fetch(
				`/api/storymaps/${(target as StorymapPermission).storymap_id}/permission?user_email=${target.user_email}`,
				{
					method: 'DELETE'
				}
			);
			return res;
		};

		public getAddMessageBody = (url: URL, username: string) => {
			return `I am inviting you to the storymap (${this.storymap.title}) at UNDP GeoHub. 
The storymap can be accessed at ${url.origin}/storymaps/${this.storymap.id}

Regards,
${username}`;
		};

		public getModifyMessageBody = (url: URL, username: string) => {
			return `I changed your permission to the storymap (${this.storymap.title}) at UNDP GeoHub. 
The storymap can be accessed at ${url.origin}/storymaps/${this.storymap.id}

Regards,
${username}`;
		};

		public getName = () => {
			return this.storymap.title as string;
		};
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { Permission } from '$lib/config/AppConfig';
	import type { DatasetPermission } from '$lib/server/DatasetPermissionManager';
	import type { StorymapPermission } from '$lib/server/StorymapPermissionManager';
	import type { StylePermission } from '$lib/server/StylePermissionManager.ts';
	import type { DashboardMapStyle, DatasetFeature, StoryMapConfig } from '$lib/types';
	import {
		FieldControl,
		ModalTemplate,
		Notification,
		handleEnterKey
	} from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';

	interface Props {
		api: UserPermissionAPIBase;
	}

	let { api }: Props = $props();

	let permissions: DatasetPermission[] | StylePermission[] | StorymapPermission[] = $state([]);

	let isUpadating = $state(false);
	let showEditDialog = $state(false);
	let showAddDialog = $state(false);
	let showDeleteDialog = $state(false);
	let targetUserPermission: DatasetPermission | StylePermission | StorymapPermission | undefined =
		$state();
	let errorMessage = $state('');

	let signedInUser = $page.data.session?.user;

	let user_email = $state('');
	let user_permission: Permission | undefined = $state();
	let isSendMessage = $state(true);
	let messageBody = $state('');

	// $: user_email, validateEmail(user_email);
	let isValidEmail = $state(false);
	let existUser = $state(false);

	let userList: string[] = $state([]);
	const minUserSearchLength = 3;
	let showUserList = $state(false);

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
			(p) => p.user_email === signedInUser?.email
		)?.permission;
		return signedInUser?.is_superuser ? Permission.OWNER : currentUserPermission;
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
		user_permission = isAdd ? Permission.READ : targetUserPermission?.permission;
		isSendMessage = true;
		if (isAdd) {
			messageBody = api.getAddMessageBody($page.url, signedInUser?.name as string);
			showAddDialog = true;
		} else {
			messageBody = api.getModifyMessageBody($page.url, signedInUser?.name as string);
			showEditDialog = true;
		}
	};

	const handleOpenDeleteDialog = (
		permission: DatasetPermission | StylePermission | StorymapPermission
	) => {
		showAddDialog = false;
		showEditDialog = false;
		targetUserPermission = permission;
		errorMessage = '';
		showDeleteDialog = true;
	};

	const handleAddPermission = async () => {
		try {
			isUpadating = true;
			if (!user_permission) return;
			const res = await api.add(user_email.toLowerCase(), user_permission);
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
			if (!targetUserPermission || !user_permission) return;
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
			if (!targetUserPermission) return;
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
		email = email.toLowerCase();
		if (!email) {
			existUser = false;
			isValidEmail = false;
			return isValidEmail;
		}
		const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
		existUser = permissions.find((p) => p.user_email.toLowerCase() === email) ? true : false;
		isValidEmail = email.match(validRegex) ? (existUser ? false : true) : false;
		return isValidEmail;
	}, 300);

	onMount(async () => {
		await getUserPermissions();
	});

	const getUsers = async () => {
		let result: string[] = [];
		if (!user_email) return result;
		if (user_email?.length < minUserSearchLength) return result;

		const res = await fetch(`/api/users?query=${user_email}`);
		const users: { id: string; user_email: string }[] = await res.json();
		result = users
			.filter((u) => {
				return (
					permissions.findIndex(
						(p) => p.user_email.toLowerCase() === u.user_email.toLowerCase()
					) === -1
				);
			})
			.map((u) => u.user_email);
		return result;
	};

	const handleEmailInput = debounce(() => {
		isValidEmail = validateEmail(user_email) as boolean;

		getUsers().then((result) => {
			userList = [...result];
			showUserList = userList?.length > 0;
		});
	}, 300);

	const handleEmailKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleEmailInput();
		}
	};

	const handleClickUseremail = (email: string) => {
		user_email = email.toLowerCase();
		isValidEmail = validateEmail(user_email) as boolean;
		userList = [];
		showUserList = false;
	};
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
							{#if permission.user_email === signedInUser?.email}
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
							{#if permission.user_email !== signedInUser?.email}
								{#if permissions.filter((p) => p.permission === Permission.OWNER && p.user_email !== permission.user_email)?.length > 0}
									{#if siginedUserPermission && permission.permission <= siginedUserPermission}
										<p class="is-flex">
											<button
												class="operation-button button"
												onclick={() => {
													targetUserPermission = permission;
													handleOpenAddOrEditDialog(false);
												}}
												disabled={siginedUserPermission === Permission.READ &&
													permission.permission === Permission.READ}
											>
												<span class="material-symbols-outlined"> edit </span>
											</button>

											<button
												class="operation-button button"
												onclick={() => {
													handleOpenDeleteDialog(permission);
												}}
											>
												<span class="material-symbols-outlined"> delete </span>
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
			class="button is-link is-uppercase has-text-weight-bold"
			onclick={() => {
				handleOpenAddOrEditDialog(true);
			}}>Add user</button
		>
	{/if}
</div>

{#if showAddDialog}
	<ModalTemplate title="Add User" bind:show={showAddDialog}>
		{#snippet content()}
			<div>
				<FieldControl title="email address" showHelp={false}>
					{#snippet control()}
						<div>
							<div class="dropdown {showUserList ? 'is-active' : ''} user-email-input">
								<div class="dropdown-trigger user-email-input">
									<div class="control has-icons-left has-icons-right">
										<input
											class="input {!isValidEmail ? 'is-danger' : 'is-success'}"
											type="email"
											bind:value={user_email}
											disabled={isUpadating}
											aria-haspopup="true"
											aria-controls="dropdown-menu"
											oninput={handleEmailInput}
											onkeydown={handleEmailKeyDown}
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
								</div>
								<div class="dropdown-menu user-list-menu" id="dropdown-menu" role="menu">
									<div class="dropdown-content">
										{#each userList as user}
											<!-- svelte-ignore a11y_missing_attribute -->
											<!-- svelte-ignore a11y_interactive_supports_focus -->
											<a
												role="menuitem"
												data-sveltekit-preload-code="off"
												data-sveltekit-preload-data="off"
												class="dropdown-item"
												onclick={() => {
													handleClickUseremail(user);
												}}
												onkeydown={handleEnterKey}
											>
												{user}
											</a>
										{/each}
									</div>
								</div>
							</div>

							{#key existUser}
								{#if existUser}
									<p class="help is-danger">This email was already registered.</p>
								{/if}
							{/key}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="specify role" showHelp={false}>
					{#snippet control()}
						<div class="select is-fullwidth">
							<select class="is-capitalized" bind:value={user_permission} disabled={isUpadating}>
								{#each getPermissionList() as p}
									<option value={p}>{getPermissionLabel(p)}</option>
								{/each}
							</select>
						</div>
					{/snippet}
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
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-link is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} "
					disabled={!(
						isValidEmail &&
						(!isSendMessage || (isSendMessage && messageBody.length > 0))
					)}
					onclick={handleAddPermission}
				>
					Add
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

{#if showEditDialog}
	<ModalTemplate title="Edit User" bind:show={showEditDialog}>
		{#snippet content()}
			<div>
				<FieldControl title="email address" showHelp={false}>
					{#snippet control()}
						<div class="control has-icons-left">
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
					{/snippet}
				</FieldControl>

				<FieldControl title="specify role" showHelp={false}>
					{#snippet control()}
						<div class="select is-fullwidth">
							<select class="is-capitalized" bind:value={user_permission} disabled={isUpadating}>
								{#each getPermissionList() as p}
									<option value={p}>{getPermissionLabel(p)}</option>
								{/each}
							</select>
						</div>
					{/snippet}
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
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-link is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} "
					disabled={!(
						(!isSendMessage || (isSendMessage && messageBody.length > 0)) &&
						permissions.find((p) => p.user_email === targetUserPermission.user_email)
							?.permission !== user_permission
					)}
					onclick={handleEditPermission}
				>
					Edit
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

{#if showDeleteDialog}
	<ModalTemplate title="Are you sure deleting this user's permission?" bind:show={showDeleteDialog}>
		{#snippet content()}
			<div>
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
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-primary is-uppercase has-text-weight-bold {isUpadating
						? 'is-loading'
						: ''} mt-2"
					onclick={handleDeletePermission}
				>
					delete this user
				</button>
			</div>
		{/snippet}
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
		background-color: transparent;
		border: none;
		outline: none;
		appearance: none;
		box-shadow: none;
	}

	.user-email-input {
		width: 100%;
	}

	.user-list-menu {
		max-height: 150px;
		overflow-x: hidden;
		overflow-y: auto;
	}
</style>
