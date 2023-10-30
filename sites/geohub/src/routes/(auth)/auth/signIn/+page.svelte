<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';
	export let data: PageData;

	let previousPage: URL = new URL($page.url.origin);
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = from?.url;
		}
	});
</script>

<div class="tile is-12 login-tile m-0 p-0 notification is-light">
	<div class="is-flex is-flex-direction-column is-justify-content-center logo">
		<img src="/assets/undp-images/undp-logo-blue.svg" alt="logo" width="64" />
	</div>

	<div class="login-container message is-link">
		<div class="message-header">Sign In to GeoHub</div>
		<div class="message-body">
			{#if data.session}
				<p class="subtitle is-6 has-text-justified has-text-dark">
					You have already signed in. To sign in by another account, please sign out first.
				</p>
				<a class="button is-primary is-normal m-1 is-fullwidth" href="/"> Go to Home </a>
				<button class="button is-link is-normal m-1 is-fullwidth" on:click={() => signOut()}>
					Sign out
				</button>
			{:else}
				<p class="subtitle is-6 has-text-justified has-text-dark">
					The single sign-on page provides users across UNDP with simple access to the relevant
					corporate platform using your existing agency credentials
				</p>
				{#each data.providers as provider}
					<button
						class="button is-primary is-medium m-1 is-fullwidth my-2"
						on:click={() => signIn(provider.id, { callbackUrl: previousPage })}
					>
						<span class="icon is-small">
							{#if provider.icon.startsWith('fa')}
								<i class={provider.icon}></i>
							{:else}
								<img src={provider.icon} alt="logo" width="20" class="mr-1" />
							{/if}
						</span>
						<span>Sign in with {provider.label}</span>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	$height: calc(100vh);

	.login-tile {
		position: relative;

		height: $height;

		.logo {
			position: absolute;
			top: 10px;
			left: 50%;
			transform: translateX(-50%);
			-webkit-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
		}

		.login-container {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			-webkit-transform: translateX(-50%) translateY(-50%);
			-ms-transform: translateX(-50%) translateY(-50%);

			height: fit-content;
			width: 360px;
			background-color: rgba(255, 255, 255, 1);

			border: 1px solid #919191;
		}
	}
</style>
