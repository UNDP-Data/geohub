<script lang="ts">
	import type { DashboardMapStyle } from '$lib/types';
	import { CopyToClipboard, FieldControl, ModalTemplate } from '@undp-data/svelte-undp-components';

	interface Props {
		style: DashboardMapStyle;
		isModalVisible?: boolean;
	}

	let { style = $bindable(), isModalVisible = $bindable(false) }: Props = $props();

	let showDevLink = $state(false);
	let mapUrl = $state('');
	let mapStyleUrl = $state('');

	const open = () => {
		mapUrl = style?.links?.find((l) => l.rel === 'map')?.href as string;
		mapStyleUrl = style?.links?.find((l) => l.rel === 'stylejson')?.href as string;
	};
	$effect(() => {
		if (isModalVisible) {
			open();
		}
	});
</script>

<ModalTemplate title="Share map" bind:show={isModalVisible}>
	{#snippet content()}
		<div>
			<FieldControl
				title="Map URL"
				fontWeight="bold"
				showHelp={false}
				isFirstCharCapitalized={false}
			>
				{#snippet control()}
					<div>
						<CopyToClipboard value={mapUrl} />
					</div>
				{/snippet}
			</FieldControl>

			<button
				class="show-dev-link mt-4 mb-5"
				onclick={() => {
					showDevLink = !showDevLink;
				}}
			>
				<span class="mr-2">
					<i
						class="fa-solid fa-chevron-down toggle-icon {showDevLink
							? 'active'
							: ''} has-text-primary"
					></i>
				</span>
				<span class="has-text-grey-dark is-uppercase has-text-weight-bold"
					>Show links for developers</span
				>
			</button>

			{#if showDevLink}
				<FieldControl
					title="Map Style URL"
					fontWeight="bold"
					showHelp={false}
					isFirstCharCapitalized={false}
				>
					{#snippet control()}
						<div>
							<CopyToClipboard value={mapStyleUrl} />
						</div>
					{/snippet}
				</FieldControl>
			{/if}
		</div>
	{/snippet}
</ModalTemplate>

<style lang="scss">
	.show-dev-link {
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
	}
</style>
