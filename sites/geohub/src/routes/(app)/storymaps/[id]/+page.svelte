<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import UserPermission, {
		StorymapPermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import Iframe from '$components/util/Iframe.svelte';
	import Star from '$components/util/Star.svelte';
	import {
		AcceptedOrganisationDomains,
		AccessLevel,
		Permission,
		TabNames
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon, getDomainFromEmail } from '$lib/helper';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import { CopyToClipboard } from '@undp-data/svelte-copy-to-clipboard';
	import {
		FieldControl,
		HeroHeader,
		initTooltipTippy,
		ModalTemplate,
		Notification,
		type BreadcrumbPage,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import Time from 'svelte-time/Time.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	export let data: PageData;

	let storymap: StoryMapConfig = data.storymap;

	const tippyTooltip = initTooltipTippy();

	let tabs: Tab[] = [
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.LINKS}`,
			label: `Share ${TabNames.LINKS}`
		}
	];

	let activeTab: string = tabs[0].id;

	let breadcrumbs: BreadcrumbPage[] = [];

	let storymapLink = '';
	let viewerLink = '';
	let editLink = '';

	const updatePageData = () => {
		storymap = data.storymap;

		breadcrumbs = [
			{ title: 'home', url: '/' },
			{ title: 'storymaps', url: '/storymaps' },
			{ title: storymap.title as string, url: $page.url.href }
		];

		storymapLink = storymap.links?.find((l) => l.rel === 'storymap')?.href as string;
		viewerLink = storymap.links?.find((l) => l.rel === 'viewer')?.href as string;
		editLink = storymap.links?.find((l) => l.rel === 'edit')?.href as string;
	};

	let confirmDeleteDialogVisible = false;
	let deletedStorymapName = '';
	let isUpdating = false;

	const handleDeleteStyle = async () => {
		isUpdating = true;
		try {
			const res = await fetch(`/api/storymaps/${storymap.id}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				confirmDeleteDialogVisible = false;

				goto('/storymaps', {
					invalidateAll: true,
					replaceState: true
				});
			}
		} finally {
			isUpdating = false;
		}
	};

	const handleDuplicate = async () => {
		if (!data.session) return;
		isUpdating = true;
		try {
			const copied: StoryMapConfig = JSON.parse(JSON.stringify(data.storymap));

			// generate new UUIDs and remove created user and updated user info.
			copied.id = uuidv4();
			delete copied.created_user;
			delete copied.createdat;
			if (copied.updated_user) {
				delete copied.updated_user;
				delete copied.updatedat;
			}
			for (let i = 0; i < copied.chapters.length; i++) {
				const chp = copied.chapters[i] as unknown as StoryMapChapter;
				chp.id = uuidv4();

				delete chp.created_user;
				delete chp.createdat;
				if (chp.updated_user) {
					delete chp.updated_user;
					delete chp.updatedat;
				}
			}

			// duplicate as a private story
			copied.access_level = AccessLevel.PRIVATE;

			const res = await fetch(`/api/storymaps`, {
				method: 'POST',
				body: JSON.stringify(copied)
			});
			if (!res.ok) {
				toast.push(`${res.status}: ${res.statusText}`);
			} else {
				await goto(`/storymaps/${copied.id}`, {
					invalidateAll: true,
					replaceState: true
				});
				updatePageData();
			}
		} finally {
			isUpdating = false;
		}
	};

	onMount(() => {
		updatePageData();

		if (storymap.permission && storymap.permission >= Permission.READ) {
			tabs = [
				...tabs.filter((t) => t.id !== `#${TabNames.LINKS}`),
				{
					id: `#${TabNames.PERMISSIONS}`,
					label: TabNames.PERMISSIONS
				},
				tabs.find((t) => t.id === `#${TabNames.LINKS}`)
			];
		}

		const hash = $page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;
	});
</script>

<HeroHeader
	title={storymap.title}
	icon={storymap.access_level < AccessLevel.PUBLIC ? getAccessLevelIcon(storymap.access_level) : ''}
	bind:breadcrumbs
	bind:tabs
	bind:activeTab
/>

<div class="m-6">
	<div hidden={activeTab !== `#${TabNames.INFO}`}>
		<div class="buttons mb-2">
			<a
				class="button is-link has-text-weight-bold is-uppercase {isUpdating ? 'is-loading' : ''}"
				href={viewerLink}
			>
				View
			</a>

			{#if $page.data.session && ((storymap.permission && storymap.permission > Permission.READ) || $page.data.session.user.is_superuser)}
				<a
					class="button is-link is-uppercase has-text-weight-bold {isUpdating ? 'is-loading' : ''}"
					href={editLink}
					use:tippyTooltip={{ content: 'Edit this storymap' }}
				>
					edit
				</a>
			{/if}

			{#if $page.data.session}
				<button
					class="button is-link is-uppercase has-text-weight-bold {isUpdating ? 'is-loading' : ''}"
					on:click={handleDuplicate}
					use:tippyTooltip={{ content: 'Duplicate this tooltip as your private storymap' }}
				>
					duplicate
				</button>
			{/if}

			{#if $page.data.session && ((storymap.permission && storymap.permission === Permission.OWNER) || $page.data.session.user.is_superuser)}
				<button
					class="button is-link is-uppercase has-text-weight-bold {isUpdating ? 'is-loading' : ''}"
					on:click={() => (confirmDeleteDialogVisible = true)}
					use:tippyTooltip={{ content: 'Delete this storymap' }}
				>
					delete
				</button>
			{/if}

			{#key storymap}
				<Star
					bind:id={storymap.id}
					bind:isStar={storymap.is_star}
					bind:no_stars={storymap.no_stars}
					table="storymaps"
					size="normal"
				/>
			{/key}
		</div>

		<div class="columns">
			<div class="column is-10 is-flex is-flex-direction-column">
				<FieldControl title="Title" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{storymap.title}
					</div>
				</FieldControl>

				{#if storymap.subtitle}
					<FieldControl title="Description" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{storymap.subtitle}
						</div>
					</FieldControl>
				{/if}

				<FieldControl title="Preview" fontWeight="bold" showHelp={false}>
					<div slot="control">
						<Iframe
							url={`${viewerLink}?embed=true`}
							id={storymap.id}
							title={storymap.title}
							height={500}
						/>
					</div>
				</FieldControl>
			</div>
			<div class="column is-flex is-flex-direction-column">
				<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{#if storymap.access_level === AccessLevel.PUBLIC}
							Public
						{:else if storymap.access_level === AccessLevel.PRIVATE}
							Private
						{:else}
							{@const domain = getDomainFromEmail(storymap.created_user)}
							{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain).name}
							{org.toUpperCase()}
						{/if}
					</div>
				</FieldControl>
				<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
					<div slot="control">
						{storymap.created_user}
					</div>
				</FieldControl>
				{#if storymap.updated_user}
					<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
						<div slot="control">
							{storymap.updated_user}
						</div>
					</FieldControl>
				{/if}
				<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
					<div slot="control">
						<Time timestamp={storymap.createdat} format="HH:mm, MM/DD/YYYY" />
					</div>
				</FieldControl>
				{#if storymap.updatedat}
					<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
						<div slot="control">
							<Time timestamp={storymap.updatedat} format="HH:mm, MM/DD/YYYY" />
						</div>
					</FieldControl>
				{/if}
			</div>
		</div>
	</div>

	{#if $page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new StorymapPermissionAPI(storymap)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<FieldControl title="Copy this link to share the storymap" fontWeight="bold" showHelp={false}>
			<div slot="control">
				<CopyToClipboard value={viewerLink} />
			</div>
		</FieldControl>

		<FieldControl
			title="Copy this link to embed the storymap to your website"
			fontWeight="bold"
			showHelp={false}
		>
			<div slot="control">
				<CopyToClipboard value="{viewerLink}?embed=true" />
			</div>
		</FieldControl>

		<FieldControl title="Storymap metadata page" fontWeight="bold" showHelp={false}>
			<div slot="control">
				<CopyToClipboard value={storymapLink} />
			</div>
		</FieldControl>
	</div>
</div>

{#if confirmDeleteDialogVisible}
	<ModalTemplate
		title="Are you sure deleting this storymap?"
		bind:show={confirmDeleteDialogVisible}
	>
		<div slot="content">
			<Notification type="warning" showCloseButton={false}>
				Unexpected bad things will happen if you don't read this!
			</Notification>
			<div class="mt-2">
				This action <b>cannot</b> be undone. This will delete
				<b>{storymap.title}</b>
				from GeoHub database. It will not be shared again with community.
				<br />
				Please type <b>{storymap.title}</b> to confirm.
			</div>
			<br />
			<input class="input" type="text" bind:value={deletedStorymapName} />
		</div>
		<div slot="buttons">
			<button
				class="button is-primary {isUpdating ? 'is-loading' : ''} has-text-weight-bold is-uppercase"
				on:click={handleDeleteStyle}
				disabled={deletedStorymapName !== storymap.title}
			>
				delete this storymap
			</button>
		</div>
	</ModalTemplate>
{/if}
