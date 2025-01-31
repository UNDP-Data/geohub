<script lang="ts">
	import type { Breadcrumb } from '$lib/interfaces';

	interface Props {
		breadcrumbs: Breadcrumb[];
		fontSize?: 'small' | 'medium' | 'large';
		disabled?: boolean;
		onclick?: (args: { index: number; breadcrumb: Breadcrumb }) => void;
	}

	let { breadcrumbs, fontSize = 'medium', disabled = false, onclick = () => {} }: Props = $props();
	const handleClicked = (index: number) => {
		if (disabled === true) return;
		if (!(breadcrumbs && breadcrumbs.length > 0)) return;
		const breadcrumb = breadcrumbs[index];
		if (onclick)
			onclick({
				index,
				breadcrumb
			});
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
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
									></i>
								{:else if breadcrumb.icon.startsWith('fi')}
									<!--Class for flag-icon CSS https://www.npmjs.com/package/flag-icons -->
									<span class={breadcrumb.icon}></span>
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
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							class={disabled ? 'isDisabled' : ''}
							aria-label={breadcrumb.name}
							tabindex="0"
							role="button"
							onclick={() => handleClicked(index)}
							onkeydown={handleKeyDown}
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
										></i>
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
