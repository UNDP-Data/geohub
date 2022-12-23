<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Breadcrumb } from '$lib/interfaces';

	const dispatch = createEventDispatcher();

	export let breadcrumbs: Breadcrumb[];
	export let fontSize:  'small' | 'medium' | 'large' = 'medium';
	const handleClicked = (index: number) => {
		if (!(breadcrumbs && breadcrumbs.length > 0)) return;
		const breadcrumb = breadcrumbs[index];
		dispatch('clicked', {
			index,
			breadcrumb
		});
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
									<i class={breadcrumb.icon} />
								{:else}
									<img src={breadcrumb.icon} alt="{breadcrumb.name}_image" />
								{/if}
							</span>
							<span style="font-size: {fontSize === 'small' ? '0.75' : fontSize === 'medium' ? '1' : '1.5' }rem">{breadcrumb.name}</span>
						</span>
					</li>
				{:else}
					<li>
						<!-- svelte-ignore a11y-missing-attribute -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<a aria-label={breadcrumb.name} on:click={() => handleClicked(index)}>
							<span class="icon-text">
								<span class="icon">
									{#if breadcrumb.icon.startsWith('fa')}
										<i class={breadcrumb.icon} />
									{:else}
										<img src={breadcrumb.icon} alt="{breadcrumb.name}_image" />
									{/if}
								</span>
								<span style="font-size: {fontSize === 'small' ? '0.75' : fontSize === 'medium' ? '1' : '1.5' }rem">{breadcrumb.name}</span>
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
	li:after{
		font-size: 1.1rem!important;
	}
</style>
