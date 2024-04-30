<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import { handleEnterKey, initTippy } from '@undp-data/svelte-undp-components';

	let panelWidth = '350px';

	let innerWidth = 0;
	$: isMobile = innerWidth < 768;

	const name = $page.data.session?.user.name;
	const names = name?.split(' ') ?? [];

	const tippy = initTippy({
		placement: 'bottom-end',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'click mouseenter',
		interactive: true,
		arrow: false,
		// theme: 'transparent',
		offset: [20, 10],
		maxWidth: panelWidth,
		onShow(instance) {
			instance.popper.querySelectorAll('.menu-button').forEach((item) => {
				item.addEventListener('click', () => {
					instance.hide();
				});
			});
		},
		onHide(instance) {
			instance.popper.querySelectorAll('.menu-button').forEach((item) => {
				item.removeEventListener('click', () => {
					instance.hide();
				});
			});
		}
	});
	let tooltipContent: HTMLElement;

	const versionInfo = JSON.parse(version);
</script>

<svelte:window bind:innerWidth />

<div class="dropdown-trigger">
	<div role="button" use:tippy={{ content: tooltipContent }}>
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
			<button class="button is-primary has-text-weight-bold is-uppercase">SIGN IN</button>
		{/if}
	</div>
</div>

<div class="dropdown-content" bind:this={tooltipContent}>
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

	:global(.tippy-content) {
		cursor: default;
	}
</style>
