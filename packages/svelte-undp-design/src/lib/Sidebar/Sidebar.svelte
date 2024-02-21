<script lang="ts">
	import type { SidebarItem } from '$lib';

	/**
	 * SidebarItem object array to be shown in sidebar component
	 */
	export let data: SidebarItem[];

	/**
	 * if enabled, make height each item become narrower
	 */
	export let isNarrow = false;

	let isMenuExpanded = false;
	let expanded: { [key: string]: boolean } = {};

	const toggleAccordion = (index: number) => {
		const key = `${index}`;
		let isExpanded = expanded[key] ?? false;
		isExpanded = !isExpanded;
		expanded[key] = isExpanded;
		Object.keys(expanded)
			.filter((id) => id !== key)
			.forEach((id) => {
				expanded[id] = false;
			});
	};

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<nav
	role="navigation"
	aria-label="Sidebar"
	class="sidebar-accordion {isMenuExpanded ? 'show-medium' : ''} {isNarrow ? 'narrow' : ''}"
>
	<div class="grid-x">
		<div class="cell large-4">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<h6
				class=""
				tabindex="0"
				data-viewport="false"
				on:click={() => {
					isMenuExpanded = !isMenuExpanded;
				}}
				on:keydown={handleEnterKey}
			>
				Menu
			</h6>
			<ul>
				{#each data as item, index}
					<li aria-label="Sidebar heading" class={expanded[`${index}`] === true ? 'active' : ''}>
						{#if item.callback}
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								tabindex="0"
								role="menuitem"
								data-sveltekit-preload-code="off"
								data-sveltekit-preload-data="off"
								on:click={() => {
									if (item.callback) {
										item.callback(item);
									}
								}}
								on:keydown={handleEnterKey}>{item.title}</a
							>
						{:else}
							<a href={item.href}>{item.title}</a>
						{/if}

						{#if item.children && item.children.length > 0}
							<button
								tabindex="0"
								aria-expanded={expanded[`${index}`] === true ? 'true' : 'false'}
								aria-label="button"
								on:click={() => {
									toggleAccordion(index);
								}}
							></button>
							<ul
								class="accordion__panel"
								style="display: {expanded[`${index}`] === true ? 'block' : 'none'};"
							>
								{#each item.children as child}
									<li>
										{#if child.callback}
											<!-- svelte-ignore a11y-missing-attribute -->
											<a
												tabindex="0"
												role="menuitem"
												data-sveltekit-preload-code="off"
												data-sveltekit-preload-data="off"
												on:click={() => {
													if (item.callback) {
														item.callback(item);
													}
												}}
												on:keydown={handleEnterKey}>{child.title}</a
											>
										{:else}
											<a href={child.href}>{child.title}</a>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/sidebar-data.min.css';
	@use '../css/sidebar.min.css';
</style>
