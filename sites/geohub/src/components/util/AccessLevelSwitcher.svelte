<script lang="ts">
	import { page } from '$app/state';
	import { AcceptedOrganisationDomains, AccessLevel } from '$lib/config/AppConfig';
	import { getDomainFromEmail } from '$lib/helper';
	import { SegmentButtons, type SegmentButton } from '@undp-data/svelte-undp-components';

	interface Props {
		accessLevel: AccessLevel;
		disableOrganisation?: boolean;
		disablePublic?: boolean;
		size?: 'small' | 'normal' | 'medium' | 'large';
		disabled?: boolean;
		/**
		 * Segment button or select box
		 */
		isSegmentButton?: boolean;
		onchange?: () => void;
	}

	let {
		accessLevel = $bindable(),
		disableOrganisation = $bindable(false),
		disablePublic = $bindable(false),
		size = $bindable('normal'),
		disabled = $bindable(false),
		isSegmentButton = $bindable(true),
		onchange = () => {}
	}: Props = $props();

	let userName: string = page.data.session?.user.name as string;
	let email = page.data.session?.user.email;
	let domain: string | undefined = email ? getDomainFromEmail(email) : undefined;

	const handleAccessLevelClicked = (e: { detail: { value: AccessLevel } }) => {
		accessLevel = e.detail.value;
		if (onchange) onchange();
	};

	const handleSelectClicked = () => {
		if (onchange) onchange();
	};

	const getSegmentButtons = () => {
		const buttons: SegmentButton[] = [
			{
				title: userName?.split(' ')[0] ?? 'me',
				value: AccessLevel.PRIVATE,
				disabled: disabled
			}
		];

		if (domain && AcceptedOrganisationDomains.map((d) => d.domain).includes(domain)) {
			const name = AcceptedOrganisationDomains.find((d) => d.domain === domain)?.name;
			buttons.push({
				title: name ? name.toUpperCase() : 'Private',
				value: AccessLevel.ORGANIZATION,
				disabled: disableOrganisation || disabled
			});
		}

		buttons.push({
			title: 'Public',
			value: AccessLevel.PUBLIC,
			disabled: disablePublic || disabled
		});

		return buttons;
	};
</script>

{#key disabled}
	{#key disableOrganisation}
		{#key disablePublic}
			{#if isSegmentButton}
				<SegmentButtons
					buttons={getSegmentButtons()}
					bind:selected={accessLevel}
					bind:size
					on:change={handleAccessLevelClicked}
				/>
			{:else}
				<div class="select is-fullwidth">
					<select bind:value={accessLevel} onchange={handleSelectClicked}>
						<option value={AccessLevel.ALL}>All</option>
						{#each getSegmentButtons() as item}
							<option value={item.value}>{item.title}</option>
						{/each}
					</select>
				</div>
			{/if}
		{/key}
	{/key}
{/key}
