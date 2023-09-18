<script lang="ts">
	import { page } from '$app/stores';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let accessLevel: AccessLevel;
	export let disableOrganisation = false;
	export let disablePublic = false;

	let userName: string = $page.data.session?.user.name;

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
	<p class="control">
		<button
			type="button"
			class="button is-normal {`${
				accessLevel === AccessLevel.ORGANIZATION ? 'is-primary is-active' : 'is-primary is-light'
			}`}"
			on:click={() => handleAccessLevelClicked(AccessLevel.ORGANIZATION)}
			disabled={disableOrganisation}
		>
			<span>
				<i class="fa-solid fa-building-lock" />
				<b>UNDP</b>
			</span>
		</button>
	</p>
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
