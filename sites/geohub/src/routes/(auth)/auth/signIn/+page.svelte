<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import type { PageData } from './$types';
	export let data: PageData;

	let previousPage: URL = new URL($page.url.origin);
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = from?.url;
		}
	});
</script>

<div class="columns">
	<div class="logo-tile column notification is-link is-4 is-12-mobile m-0 p-0">
		<div class="is-flex is-flex-direction-column is-justify-content-center logo">
			<img src="/assets/undp-images/undp-logo-white.svg" alt="logo" />
		</div>
	</div>
	<div class="column is-8 login-tile is-12-mobile m-0 p-0">
		<div class="login-container is-flex is-flex-direction-column p-4">
			<p class="subtitle is-6 has-text-dark">
				The single sign-on page provides users across UNDP with simple access to the relevant
				corporate platform using your existing agency credentials
			</p>
			{#each data.providers as provider}
				<button
					class="button is-link m-1"
					on:click={() => signIn(provider.id, { callbackUrl: previousPage })}
				>
					Sign in with {provider.label}
				</button>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

	$height: calc(100vh);

	.login-tile {
		position: relative;

		height: $height;

		background-image: url('/assets/geohub-login.png');

		.login-container {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			-webkit-transform: translateX(-50%) translateY(-50%);
			-ms-transform: translateX(-50%) translateY(-50%);

			height: calc(100vh);

			height: fit-content;
			width: 300px;
			background-color: rgba(255, 255, 255, 0.5);
		}
	}

	.logo-tile {
		position: relative;

		height: $height;

		.logo {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			-webkit-transform: translateX(-50%) translateY(-50%);
			-ms-transform: translateX(-50%) translateY(-50%);
			width: 150px;
		}
	}
</style>
