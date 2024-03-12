<script lang="ts">
	import { handleEnterKey } from '@undp-data/svelte-undp-components';

	let tabs: { label: 'default' | 'classify'; icon: string }[] = [
		{
			label: 'default',
			icon: 'fa-solid fa-minus'
		},
		{
			label: 'classify',
			icon: 'fa-solid fa-list'
		}
	];

	export let legendType: 'default' | 'classify' = tabs[0].label;
</script>

<div class="tabs is-centered is-toggle">
	<ul>
		{#each tabs as tab}
			<li class={legendType === tab.label ? 'is-active' : ''}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="has-text-weight-bold"
					role="tab"
					tabindex="0"
					data-sveltekit-preload-code="off"
					data-sveltekit-preload-data="off"
					on:click={() => {
						legendType = tab.label;
					}}
					on:keydown={handleEnterKey}
				>
					<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
					<span class="is-capitalized">{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
