<script lang="ts">
	import { page } from '$app/stores';
	import { handleEnterKey, initTippy } from '$lib/helper';
	import { signOut } from '@auth/sveltekit/client';

	let panelWidth = '350px';

	let innerWidth = 0;
	$: isMobile = innerWidth < 768;

	const name = $page.data.session?.user.name;
	const names = name?.split(' ') ?? [];

	const tippy = initTippy({
		placement: 'bottom-end',
		interactive: true,
		arrow: false,
		theme: 'transparent',
		offset: [20, 10],
		maxWidth: panelWidth,
		onShow(instance) {
			instance.popper.querySelector('.menu-button')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.menu-button')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;
</script>

<svelte:window bind:innerWidth />

{#if $page.data.session}
	<div class="dropdown-trigger">
		<div role="button" use:tippy={{ content: tooltipContent }}>
			{#if $page.data.session.user?.image}
				<span
					style="background-image: url('{$page.data.session.user.image}')"
					class="signin-button avatar"
				/>
			{:else}
				<span
					class="signin-button initial-avator is-flex is-justify-content-center is-align-items-center has-background-grey-lighter"
				>
					{#each names as name}
						<p class="is-size-5 has-text-black">
							{name.slice(0, 1)}
						</p>
					{/each}
				</span>
			{/if}
		</div>
	</div>

	<div
		class="dropdown-content"
		style="max-width: {panelWidth}"
		role="menu"
		bind:this={tooltipContent}
	>
		<div class="dropdown-item">
			<p class="is-size-6 has-text-weight-bold">{$page.data.session.user.name}</p>
			<p class="is-size-7">{$page.data.session.user.email}</p>
			<hr class="dropdown-divider" />
		</div>
		<a
			role="button"
			tabindex="0"
			href="/settings"
			class="dropdown-item settings-div is-flex is-justify-content-space-between is-align-items-center menu-button"
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
			on:click={() => signOut()}
			on:keydown={handleEnterKey}
			class="dropdown-item settings-div is-flex is-justify-content-space-between is-align-items-center menu-button"
		>
			<div class="is-flex-grow-1">
				<p class="pl-2">Sign out</p>
			</div>
		</div>
	</div>
{:else}
	<a
		class="signin-button button is-primary {isMobile ? 'is-small' : 'is-normal'}"
		href="/auth/signIn"><b>SIGN IN</b></a
	>
{/if}

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
