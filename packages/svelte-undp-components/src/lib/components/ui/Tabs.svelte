<script module lang="ts">
	export interface Tab {
		id: string;
		label: string;
		icon?: string;
		counter?: number;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';

	interface Props {
		isFullwidth?: boolean;
		isBoxed?: boolean;
		isCentered?: boolean;
		size?: 'is-small' | 'is-medium' | 'is-large' | 'is-normal';
		tabs: Tab[];
		isCapitalized?: boolean;
		isUppercase?: boolean;
		fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
		activeTab: string;
		onchange?: (tab: string) => void;
	}

	let {
		isFullwidth = false,
		isBoxed = true,
		isCentered = true,
		size = 'is-normal',
		tabs = $bindable(),
		isCapitalized = false,
		isUppercase = false,
		fontWeight = 'normal',
		activeTab = $bindable(),
		onchange = () => {}
	}: Props = $props();
</script>

<div
	class="tabs {isCentered ? 'is-centered' : ''} {size} {isBoxed ? 'is-boxed' : null} {isFullwidth
		? 'is-fullwidth'
		: null} m-0 mt-2 mb-2"
>
	<ul>
		{#each tabs as tab}
			<li class={activeTab === tab.id ? 'is-active' : 'inactive-tab'}>
				<a
					href={tab.id.startsWith('#') ? tab.id : null}
					role="tab"
					class="tab-{tab.id.toLowerCase()}"
					tabindex="0"
					onclick={() => {
						activeTab = tab.id;
						if (onchange) onchange(activeTab);
					}}
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
					onkeydown={handleEnterKey}
				>
					{#if tab.icon}
						<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
					{/if}
					<span
						class="has-text-weight-{fontWeight} {isCapitalized ? 'is-capitalized' : ''} {isUppercase
							? 'is-uppercase'
							: ''}"
					>
						{tab.label}
						{#if tab.counter && tab.counter > 0}
							<span class="counter is-size-7">{tab.counter}</span>
						{/if}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.tabs {
		.counter {
			background-color: rgb(233, 231, 231);
			border: max(1px, 0.0625rem) solid rgb(233, 231, 231);
			border-radius: 2em;
			color: #1c1c1c;
			display: inline-block;
			font-weight: 500;
			line-height: calc(1.25rem - max(1px, 0.0625rem) * 2);
			min-width: var(--base-size-20, 1.25rem);
			padding: 0 6px;
			text-align: center;
		}
	}
</style>
