<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import UserPermission, {
		StorymapPermissionAPI
	} from '$components/pages/data/datasets/UserPermission.svelte';
	import Star from '$components/util/Star.svelte';
	import {
		AcceptedOrganisationDomains,
		AccessLevel,
		Permission,
		TabNames
	} from '$lib/config/AppConfig';
	import { getAccessLevelIcon, getDomainFromEmail } from '$lib/helper';
	import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
	import {
		CopyToClipboard,
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let storymap: StoryMapConfig = $state(data.storymap);

	const tippyTooltip = initTooltipTippy();

	let tabs: Tab[] = $state([
		{
			id: `#${TabNames.INFO}`,
			label: TabNames.INFO
		},
		{
			id: `#${TabNames.LINKS}`,
			label: `Share ${TabNames.LINKS}`
		}
	]);

	let activeTab: string = $state(`#${TabNames.INFO}`);

	let breadcrumbs: BreadcrumbPage[] = $state([]);

	let storymapLink = $state('');
	let viewerLink = $state('');
	let editLink = $state('');
	let apiLink = $state('');

	const updatePageData = () => {
		storymap = data.storymap;

		breadcrumbs = [
			{ title: 'home', url: '/' },
			{ title: 'storymaps', url: '/storymaps' },
			{ title: storymap.title as string, url: page.url.href }
		];

		storymapLink = storymap.links?.find((l) => l.rel === 'storymap')?.href as string;
		viewerLink = storymap.links?.find((l) => l.rel === 'viewer')?.href as string;
		editLink = storymap.links?.find((l) => l.rel === 'edit')?.href as string;
		apiLink = storymap.links?.find((l) => l.rel === 'self')?.href as string;
	};

	const iframeCodeSnippet = `<iframe
  id="storymapIframe"
  title="{title}"
  width="100%"
  height="400"
  src="{embedUrl}"
>
</iframe>
`;

	let confirmDeleteDialogVisible = $state(false);
	let deletedStorymapName = $state('');
	let isUpdating = $state(false);

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

		const hash = page.url.hash;
		activeTab = hash.length > 0 && tabs.find((t) => t.id === hash) ? hash : `#${TabNames.INFO}`;
	});
</script>

<HeroHeader
	title={storymap.title as string}
	icon={storymap.access_level && storymap.access_level < AccessLevel.PUBLIC
		? getAccessLevelIcon(storymap.access_level)
		: ''}
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

			{#if page.data.session && ((storymap.permission && storymap.permission > Permission.READ) || page.data.session.user.is_superuser)}
				<a
					class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
						? 'is-loading'
						: ''}"
					href={editLink}
					use:tippyTooltip={{ content: 'Edit this storymap' }}
				>
					edit
				</a>
			{/if}

			{#if page.data.session}
				<button
					class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
						? 'is-loading'
						: ''}"
					onclick={handleDuplicate}
					use:tippyTooltip={{ content: 'Duplicate this tooltip as your private storymap' }}
				>
					duplicate
				</button>
			{/if}

			{#if page.data.session && ((storymap.permission && storymap.permission === Permission.OWNER) || page.data.session.user.is_superuser)}
				<button
					class="button is-link is-outlined is-uppercase has-text-weight-bold {isUpdating
						? 'is-loading'
						: ''}"
					onclick={() => (confirmDeleteDialogVisible = true)}
					use:tippyTooltip={{ content: 'Delete this storymap' }}
				>
					delete
				</button>
			{/if}

			{#key storymap}
				<Star
					bind:id={storymap.id as string}
					bind:isStar={storymap.is_star as boolean}
					bind:no_stars={storymap.no_stars}
					table="storymaps"
					size="normal"
				/>
			{/key}
		</div>

		<div class="columns">
			<div class="column is-10 is-flex is-flex-direction-column">
				<FieldControl title="Title" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							{storymap.title}
						</div>
					{/snippet}
				</FieldControl>

				{#if storymap.subtitle}
					<FieldControl title="Description" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								{storymap.subtitle}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				<FieldControl title="Preview" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<iframe
								title={storymap.title}
								id={storymap.id}
								frameborder="0"
								src={`${viewerLink}?embed=true`}
								width="100%"
								height={500}
							></iframe>
						</div>
					{/snippet}
				</FieldControl>
			</div>
			<div class="column is-flex is-flex-direction-column">
				<FieldControl title="Access level" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							{#if storymap.access_level === AccessLevel.PUBLIC}
								Public
							{:else if storymap.access_level === AccessLevel.PRIVATE}
								Private
							{:else}
								{@const domain = getDomainFromEmail(storymap.created_user as string)}
								{@const org = AcceptedOrganisationDomains.find((d) => d.domain === domain)?.name}
								{org?.toUpperCase()}
							{/if}
						</div>
					{/snippet}
				</FieldControl>
				<FieldControl title="Created by" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div class="wordwrap">
							{storymap.created_user}
						</div>
					{/snippet}
				</FieldControl>
				{#if storymap.updated_user}
					<FieldControl title="Updated by" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div class="wordwrap">
								{storymap.updated_user}
							</div>
						{/snippet}
					</FieldControl>
				{/if}
				<FieldControl title="Created at" fontWeight="bold" showHelp={false}>
					{#snippet control()}
						<div>
							<Time timestamp={storymap.createdat} format="HH:mm, MM/DD/YYYY" />
						</div>
					{/snippet}
				</FieldControl>
				{#if storymap.updatedat}
					<FieldControl title="Updated at" fontWeight="bold" showHelp={false}>
						{#snippet control()}
							<div>
								<Time timestamp={storymap.updatedat} format="HH:mm, MM/DD/YYYY" />
							</div>
						{/snippet}
					</FieldControl>
				{/if}
			</div>
		</div>
	</div>

	{#if page.data.session}
		<div hidden={activeTab !== `#${TabNames.PERMISSIONS}`}>
			<UserPermission api={new StorymapPermissionAPI(storymap)} />
		</div>
	{/if}

	<div hidden={activeTab !== `#${TabNames.LINKS}`}>
		<FieldControl title="Copy this link to share the storymap" fontWeight="bold" showHelp={false}>
			{#snippet control()}
				<div>
					<CopyToClipboard value={viewerLink} />
				</div>
			{/snippet}
		</FieldControl>

		<FieldControl
			title="Copy this link to embed the storymap to your website"
			fontWeight="bold"
			showHelp={false}
		>
			{#snippet control()}
				<div>
					<CopyToClipboard value="{viewerLink}?embed=true" />
				</div>
			{/snippet}
		</FieldControl>

		<FieldControl
			title="Copy this code snippet to your website to embed the storymap"
			fontWeight="bold"
			showHelp={false}
		>
			{#snippet control()}
				<div>
					<CopyToClipboard
						value={iframeCodeSnippet
							.replace('{title}', storymap.title as string)
							.replace('{embedUrl}', `${viewerLink}?embed=true`)}
						isMultiline={true}
						rows={9}
					/>
				</div>
			{/snippet}
		</FieldControl>

		<FieldControl title="Storymap metadata page" fontWeight="bold" showHelp={false}>
			{#snippet control()}
				<div>
					<CopyToClipboard value={storymapLink} />
				</div>
			{/snippet}
		</FieldControl>

		<FieldControl title="Storymap metadata API" fontWeight="bold" showHelp={false}>
			{#snippet control()}
				<div>
					<CopyToClipboard value={apiLink} />
				</div>
			{/snippet}
		</FieldControl>
	</div>
</div>

{#if confirmDeleteDialogVisible}
	<ModalTemplate
		title="Are you sure deleting this storymap?"
		bind:show={confirmDeleteDialogVisible}
	>
		{#snippet content()}
			<div>
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
		{/snippet}
		{#snippet buttons()}
			<div>
				<button
					class="button is-primary {isUpdating
						? 'is-loading'
						: ''} has-text-weight-bold is-uppercase"
					onclick={handleDeleteStyle}
					disabled={deletedStorymapName !== storymap.title}
				>
					delete this storymap
				</button>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

<style lang="scss">
	.wordwrap {
		overflow-wrap: break-word;
		word-break: break-all;
	}
</style>
