<script lang="ts">
	import type { Breadcrumb } from '$lib/interfaces';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let breadcrumbs: Breadcrumb[];
	export let fontSize: 'small' | 'medium' | 'large' = 'medium';
	export let disabled = false;
	const handleClicked = (index: number) => {
		if (disabled === true) return;
		if (!(breadcrumbs && breadcrumbs.length > 0)) return;
		const breadcrumb = breadcrumbs[index];
		dispatch('clicked', {
			index,
			breadcrumb
		});
	};
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			dispatch('clicked');
		}
	};
</script>

{#if breadcrumbs && breadcrumbs.length > 0}
	<nav aria-label="breadcrumb" data-viewport="true" class="breadcrumb-undp inviewport">
		<ul>
			{#each breadcrumbs as breadcrumb, index}
				{#if index === breadcrumbs.length - 1}
					<li>
						<span class="icon-text">
							<span class="icon">
								{#if breadcrumb.icon.startsWith('fa')}
									<i
										class="{breadcrumb.icon} {fontSize === 'small'
											? 'fa-sm'
											: fontSize === 'medium'
											  ? 'fa-1x'
											  : 'fa-2x'}"
									/>
								{:else if breadcrumb.icon.startsWith('fi')}
									<!--Class for flag-icon CSS https://www.npmjs.com/package/flag-icons -->
									<span class={breadcrumb.icon} />
								{:else}
									<img src={breadcrumb.icon} alt="{breadcrumb.name}_image" />
								{/if}
							</span>
							<span
								style="font-size: {fontSize === 'small'
									? '0.75'
									: fontSize === 'medium'
									  ? '1'
									  : '1.5'}rem">{breadcrumb.name}</span
							>
						</span>
					</li>
				{:else}
					<li>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class={disabled ? 'isDisabled' : ''}
							aria-label={breadcrumb.name}
							tabindex="0"
							role="button"
							on:click={() => handleClicked(index)}
							on:keydown={handleKeyDown}
						>
							<span class="icon-text">
								<span class="icon">
									{#if breadcrumb.icon.startsWith('fa')}
										<i
											class="{breadcrumb.icon} {fontSize === 'small'
												? 'fa-sm'
												: fontSize === 'medium'
												  ? 'fa-1x'
												  : 'fa-2x'}"
										/>
									{:else}
										<img src={breadcrumb.icon} alt="{breadcrumb.name}_image" />
									{/if}
								</span>
								<span
									style="font-size: {fontSize === 'small'
										? '0.75'
										: fontSize === 'medium'
										  ? '1'
										  : '1.5'}rem">{breadcrumb.name}</span
								>
							</span>
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	</nav>
{/if}

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/breadcrumbs.min.css';

	li:after {
		font-size: 1.1rem !important;
	}

	.fi {
		width: 24px !important;
		height: 24px !important;
		line-height: 2em !important;
	}

	.isDisabled {
		color: currentColor;
		cursor: not-allowed;
		opacity: 0.5;
		text-decoration: none;
	}
</style>
