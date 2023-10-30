<script lang="ts">
	import { page } from '$app/stores';
	import { AcceptedOrganisationDomains, AccessLevel } from '$lib/config/AppConfig';
	import { getDomainFromEmail } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let accessLevel: AccessLevel;
	export let disableOrganisation = false;
	export let disablePublic = false;

	let userName: string = $page.data.session?.user.name;
	let domain: string = getDomainFromEmail($page.data.session?.user.email);

	const handleAccessLevelClicked = (level: AccessLevel) => {
		accessLevel = level;
		dispatch('change');
	};
</script>

<div class="field has-addons">
	<p class="control">
		<button
			type="button"
			class="button is-normal {`${
				accessLevel === AccessLevel.PRIVATE ? 'is-primary is-active' : 'is-primary is-light'
			}`}"
			on:click={() => handleAccessLevelClicked(AccessLevel.PRIVATE)}
		>
			<span>
				<i class="fa-solid fa-user-lock" />
				<b>{userName?.split(' ')[0] ?? 'me'}</b>
			</span>
		</button>
	</p>
	{#if AcceptedOrganisationDomains.map((d) => d.domain).includes(domain)}
		{@const name = AcceptedOrganisationDomains.find((d) => d.domain === domain).name}
		<p class="control">
			<button
				type="button"
				class="button is-normal {`${
					accessLevel === AccessLevel.ORGANIZATION ? 'is-primary is-active' : 'is-primary is-light'
				}`}"
				on:click={() => handleAccessLevelClicked(AccessLevel.ORGANIZATION)}
				disabled={disableOrganisation}
			>
				<span class="is-uppercase has-text-weight-bold">
					<i class="fa-solid fa-building-lock" />
					{name}
				</span>
			</button>
		</p>
	{/if}
	<p class="control">
		<button
			type="button"
			class="button is-normal {`${
				accessLevel === AccessLevel.PUBLIC ? 'is-primary is-active' : 'is-primary is-light'
			}`}"
			on:click={() => handleAccessLevelClicked(AccessLevel.PUBLIC)}
			disabled={disablePublic}
		>
			<span>
				<i class="fa-solid fa-lock-open" />
				<b>Public</b>
			</span>
		</button>
	</p>
</div>
