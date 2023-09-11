<script lang="ts">
	import { page } from '$app/stores';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import chroma from 'chroma-js';

	let panelWidth = '350px';

	let innerWidth = 0;
	const responsiveMaxWidth = 1024;
	$: isMobile = innerWidth < 768;

	const name = $page.data.session?.user.name;
	const names = name?.split(' ') ?? [];

	const tippy = initTippy({
		placement: 'bottom-end',
		interactive: true,
		arrow: false,
		theme: 'transparent',
		offset: [0, 0],
		maxWidth: panelWidth
	});
	let tooltipContent: HTMLElement;
</script>

<svelte:window bind:innerWidth />

<div class="signin-button">
	{#if $page.data.session}
		<div class="dropdown-trigger">
			<div role="button" use:tippy={{ content: tooltipContent }}>
				{#if innerWidth >= responsiveMaxWidth}
					<div class="columns is-vcentered is-mobile">
						<div class="column pl-5">
							<div>
								{#if $page.data.session.user?.image}
									<span
										style="background-image: url('{$page.data.session.user.image}')"
										class="avatar"
									/>
								{:else}
									<span
										class="initial-avator is-flex is-justify-content-center is-align-items-center"
										style="background-color: {chroma.random()}"
									>
										{#each names as name}
											<p class="name" style="color: white">
												{name.slice(0, 1)}
											</p>
										{/each}
									</span>
								{/if}
							</div>
						</div>
						<div
							class="user-info column flex is-flex-direction-column is-align-content-flex-start pl-0"
						>
							<p class="title is-5 m-0 mb-1">{$page.data.session.user.name}</p>
							{#if $page.data.session.user['jobTitle']}
								<p class="subtitle is-7 m-0 mb-1">{$page.data.session.user['jobTitle']}</p>
							{/if}
							<p class="subtitle is-7 m-0">{$page.data.session.user.email}</p>
						</div>
					</div>
				{:else}
					<div>
						{#if $page.data.session.user?.image}
							<span
								style="background-image: url('{$page.data.session.user.image}')"
								class="avatar"
							/>
						{:else}
							<span
								class="initial-avator is-flex is-justify-content-center is-align-items-center"
								style="background-color: {chroma.random()}"
							>
								{#each names as name}
									<p class="name" style="color: white">
										{name.slice(0, 1)}
									</p>
								{/each}
							</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div
			class="dropdown-content"
			style="max-width: {panelWidth}"
			role="menu"
			bind:this={tooltipContent}
		>
			<div class="dropdown-item has-text-centered">
				<p class="title mb-2 is-4">{$page.data.session.user.name}</p>
				{#if $page.data.session.user['jobTitle']}
					<p class="has-text-weight-bold">{$page.data.session.user['jobTitle']}</p>
				{/if}
				<p>{$page.data.session.user.email}</p>
				<hr class="dropdown-divider" />
			</div>
			<a
				role="button"
				tabindex="0"
				href="/settings"
				class="dropdown-item settings-div is-flex is-justify-content-space-between is-align-items-center"
				data-sveltekit-preload-code="viewport"
				data-sveltekit-preload-data="hover"
			>
				<div class="is-flex-grow-1">
					<p class="pl-2">Settings</p>
				</div>
				<div class="is-flex-shrink-0">
					<span class="icon is-small">
						<i class="fas fa-chevron-right" aria-hidden="true" />
					</span>
				</div>
			</a>
			<hr class="dropdown-divider" />
			<div
				role="button"
				tabindex="0"
				on:click={() => signOut('azure-ad')}
				on:keydown={handleEnterKey}
				class="dropdown-item settings-div is-flex is-justify-content-space-between is-align-items-center"
			>
				<div class="is-flex-grow-1">
					<p class="pl-2">Sign out</p>
				</div>
			</div>
		</div>
	{:else}
		<button
			class="button is-primary {isMobile ? 'is-small' : 'is-normal'}"
			on:click={() => signIn('azure-ad')}><b>SIGN IN</b></button
		>
	{/if}
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

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

		.name {
			font-size: large;
		}
	}

	.user-info {
		.subtitle {
			white-space: nowrap;
		}
	}

	.settings-div {
		cursor: pointer;
		&:hover {
			background-color: #f5f5f5;
		}
	}

	:global(.tippy-content) {
		cursor: default;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
