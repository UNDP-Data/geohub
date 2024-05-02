<script lang="ts">
	import { Sidebar, type SidebarPosition } from '$lib';
	import '@undp-data/undp-bulma/dist/style.css';

	let sidebarPosition: SidebarPosition = 'left';
	let sidebarBorderStyle = '1px solid #1c1c1c';
</script>

<Sidebar show={true} bind:position={sidebarPosition} bind:border={sidebarBorderStyle}>
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

		<div class="field">
			<label class="label" for="border-style-input">Border style</label>
			<div class="control" id="border-style-input">
				<input
					class="input"
					type="text"
					placeholder="Sidebar border style"
					bind:value={sidebarBorderStyle}
				/>
			</div>
		</div>
	</div>
	<div slot="main">
		<h1>Welcome to your library project</h1>
		<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
		<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	</div>
</Sidebar>
