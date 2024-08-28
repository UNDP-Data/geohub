<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import { handleEnterKey, ModalTemplate } from '@undp-data/svelte-undp-components';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { marked } from 'marked';

	let innerWidth = 0;
	$: isMobile = innerWidth < 768;

	const name = $page.data.session?.user.name;
	const names = name?.split(' ') ?? [];

	let showdDropdown = false;

	let sections: { title: string; content: string; isOpen: boolean }[] = [];
	let showChangelogDialog = false;

	const versionInfo = JSON.parse(version);

	const getChangelog = async () => {
		const res = await fetch(`/CHANGELOG.md`);
		const changelog = await res.text();
		const html = await marked(changelog);

		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const h2s = doc.querySelectorAll('h2');

		sections = [];

		h2s.forEach((h2, index) => {
			const content = [];
			let sibling = h2.nextElementSibling;

			while (sibling && sibling.tagName !== 'H2') {
				content.push(sibling.outerHTML);
				sibling = sibling.nextElementSibling;
			}

			sections.push({
				title: h2.outerHTML,
				content: content.join(''),
				isOpen: index === 0
			});
		});
	};

	const toggleSection = (index: number) => {
		sections[index].isOpen = !sections[index].isOpen;
	};
</script>

<svelte:window bind:innerWidth />

<div
	role="button"
	tabindex="0"
	class="download-dropdown dropdown is-right {showdDropdown ? 'is-active' : ''}"
	on:mouseenter={() => {
		showdDropdown = true;
	}}
	on:mouseleave={() => {
		showdDropdown = false;
	}}
>
	<div class="dropdown-trigger">
		{#if $page.data.session}
			{#if $page.data.session.user?.image}
				<span style="background-image: url('{$page.data.session.user.image}')" class="avatar" />
			{:else}
				<span
					class="initial-avator is-flex is-justify-content-center is-align-items-center has-background-grey-lighter"
				>
					{#each names as name}
						<p class="is-size-5 has-text-black">
							{name.slice(0, 1)}
						</p>
					{/each}
				</span>
			{/if}
		{:else if isMobile}
			<span
				class="initial-avator is-flex is-justify-content-center is-align-items-center has-text-primary"
			>
				<span class="icon is-small has-text-primary">
					<i class="fas fa-right-to-bracket fa-lg" />
				</span>
			</span>
		{:else}
			<a class="button is-primary has-text-weight-bold is-uppercase" href="/auth/signIn">SIGN IN</a>
		{/if}
	</div>
	<div class="dropdown-menu" id="dropdown-menu" role="menu">
		<div class="dropdown-content">
			<div class="dropdown-item">
				{#if $page.data.session}
					<p class="is-size-6 has-text-weight-bold">{$page.data.session.user.name}</p>
					<p class="is-size-7">{$page.data.session.user.email}</p>
				{:else}
					<p class="is-size-6 mb-2">Please sign in</p>
					<a
						class="button is-primary is-fullwidth has-text-weight-bold is-uppercase"
						href="/auth/signIn">SIGN IN</a
					>
				{/if}
			</div>
			<hr class="dropdown-divider" />

			<div class="dropdown-item">
				<p>Version {versionInfo.version}</p>
			</div>
			<hr class="dropdown-divider" />
			<a href="/license" class="dropdown-item menu-button">
				<p>License</p>
			</a>
			<hr class="dropdown-divider" />
			<!-- svelte-ignore a11y-missing-attribute -->
			<a
				class="dropdown-item menu-button"
				role="button"
				tabindex="0"
				on:click|preventDefault={() => {
					showChangelogDialog = true;
				}}
				on:keydown={handleEnterKey}
			>
				<p>Changelog</p>
			</a>
			{#if $page.data.session}
				<hr class="dropdown-divider" />
				<a href="/settings" class="dropdown-item is-flex is-align-items-center menu-button">
					Settings
				</a>

				<hr class="dropdown-divider" />
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					role="button"
					tabindex="0"
					on:click={() => signOut()}
					on:keydown={handleEnterKey}
					class="dropdown-item menu-button"
				>
					Sign out
				</a>
			{/if}
		</div>
	</div>
</div>

{#if showChangelogDialog}
	<ModalTemplate title="Changelog" bind:show={showChangelogDialog}>
		<div slot="content">
			{#await getChangelog()}
				<div class="is-flex is-justify-content-center">
					<Loader size="small" />
				</div>
			{:then}
				<div class="changelog-content content">
					{#each sections as section, index}
						<div class="changelog-section">
							<div
								class="changelog-header py-4 is-flex is-align-items-center"
								role="button"
								tabindex="0"
								on:click={() => toggleSection(index)}
								on:keydown={handleEnterKey}
							>
								<span class="mr-2">
									<i
										class="fa-solid fa-chevron-down toggle-icon {sections[index].isOpen
											? 'active'
											: ''} has-text-primary"
									/>
								</span>
								<span>
									<!-- eslint-disable svelte/no-at-html-tags -->
									{@html section.title}
								</span>
							</div>
							{#if section.isOpen}
								<div class="changelog-body py-2">
									<!-- eslint-disable svelte/no-at-html-tags -->
									{@html section.content}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/await}
		</div>
	</ModalTemplate>
{/if}

<style lang="scss">
	.avatar {
		border-radius: 2rem;
		float: left;
		height: 2.8rem;
		width: 2.8rem;
		background-color: white;
		background-size: cover;
		background-repeat: no-repeat;
	}

	.initial-avator {
		border-radius: 2rem;
		height: 2.8rem;
		width: 2.8rem;
		background-size: cover;
		background-repeat: no-repeat;
	}

	.menu-button {
		cursor: pointer;
	}

	.changelog-content {
		max-height: 500px;
		cursor: default;

		.changelog-header {
			cursor: pointer;
			border-bottom: 1px solid #ddd;

			.toggle-icon {
				-webkit-transition: all 0.3s ease;
				-moz-transition: all 0.3s ease;
				-ms-transition: all 0.3s ease;
				-o-transition: all 0.3s ease;
				transition: all 0.3s ease;

				&.active {
					transform: rotate(-180deg);
					-webkit-transform: rotate(-180deg);
					-moz-transform: rotate(-180deg);
					-ms-transform: rotate(-180deg);
					-o-transform: rotate(-180deg);
					transition: rotateZ(-180deg);
				}
			}

			:global(h2) {
				margin-bottom: 0 !important;
			}

			.changelog-section:not(:first-child) .changelog-header {
				margin-top: 1em;
			}
		}
	}
</style>
