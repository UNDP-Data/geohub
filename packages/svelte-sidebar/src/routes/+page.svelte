<script lang="ts">
	import { Sidebar, type SidebarPosition } from '$lib';

	let sidebarPosition: SidebarPosition = 'left';
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
		integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<Sidebar show={true} bind:position={sidebarPosition}>
	<div slot="content" class="p-4">
		Sidebar content

		<div class="buttons has-addons">
			<button
				class="button {sidebarPosition === 'left' ? 'is-link is-selected' : ''}"
				on:click={() => {
					sidebarPosition = 'left';
				}}>Left</button
			>
			<button
				class="button {sidebarPosition === 'right' ? 'is-link is-selected' : ''}"
				on:click={() => {
					sidebarPosition = 'right';
				}}>Right</button
			>
		</div>
	</div>
	<div slot="main">
		<h1>Welcome to your library project</h1>
		<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	</div>
</Sidebar>
