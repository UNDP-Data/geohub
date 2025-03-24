<script lang="ts">
	import type { SidebarItem } from '$lib';

	interface Props {
		/**
		 * SidebarItem object array to be shown in sidebar component
		 */
		data: SidebarItem[];
		/**
		 * if enabled, make height each item become narrower
		 */
		isNarrow?: boolean;
		/**
		 * If true, sidebar width is fixed. if false, width will be flexiblely changed in accordance with parent component.
		 */
		isFixed?: boolean;
	}

	let { data, isNarrow = false, isFixed = true }: Props = $props();

	let isMenuExpanded = $state(false);
	let expanded: { [key: string]: boolean } = $state({});

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

<!-- svelte-ignore a11y_no_redundant_roles -->
<nav
	role="navigation"
	aria-label="Sidebar"
	class="sidebar-accordion {isMenuExpanded ? 'show-medium' : ''} {isNarrow ? 'narrow' : ''}"
>
	<div class={isFixed ? 'grid-x' : ''}>
		<div class="cell large-4">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<h6
				class=""
				tabindex="0"
				data-viewport="false"
				onclick={() => {
					isMenuExpanded = !isMenuExpanded;
				}}
				onkeydown={handleEnterKey}
			>
				Menu
			</h6>
			<ul>
				{#each data as item, index (data.indexOf(item))}
					<li aria-label="Sidebar heading" class={expanded[`${index}`] === true ? 'active' : ''}>
						{#if item.callback}
							<!-- svelte-ignore a11y_missing_attribute -->
							<a
								tabindex="0"
								role="menuitem"
								data-sveltekit-preload-code="off"
								data-sveltekit-preload-data="off"
								onclick={() => {
									if (item.callback) {
										item.callback(item);
									}
								}}
								onkeydown={handleEnterKey}>{item.title}</a
							>
						{:else}
							<a href={item.href}>{item.title}</a>
						{/if}

						{#if item.children && item.children.length > 0}
							<button
								tabindex="0"
								aria-expanded={expanded[`${index}`] === true ? 'true' : 'false'}
								aria-label="button"
								onclick={() => {
									toggleAccordion(index);
								}}
							></button>
							<ul
								class="accordion__panel"
								style="display: {expanded[`${index}`] === true ? 'block' : 'none'};"
							>
								{#each item.children as child (item.children.indexOf(child))}
									<li>
										{#if child.callback}
											<!-- svelte-ignore a11y_missing_attribute -->
											<a
												tabindex="0"
												role="menuitem"
												data-sveltekit-preload-code="off"
												data-sveltekit-preload-data="off"
												onclick={() => {
													if (item.callback) {
														item.callback(item);
													}
												}}
												onkeydown={handleEnterKey}>{child.title}</a
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
