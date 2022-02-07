<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<script lang="ts">
    import Button from '@smui/button'

</script>


<Button on:click={() => alert('It worked')}>Click me...</Button>
<Button on:click={() => alert('It worked')} color="secondary">Click me...</Button>
