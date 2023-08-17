<script lang="ts">
	let innerWidth = 0;
</script>

<svelte:window bind:innerWidth />

<div class="row columns is-vcentered m-0 is-mobile">
	<div class="column is-4-desktop is-7-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">Name</p>
	</div>
	<div class="column is-2-mobile is-1-desktop">
		<p class="is-size-6 has-text-centered has-text-weight-bold">SDG</p>
	</div>
	{#if innerWidth >= 768}
		<div class="column is-2">
			<p class="is-size-6 has-text-centered has-text-weight-bold">License</p>
		</div>
		<div class="column is-2">
			<p class="is-size-6 has-text-centered has-text-weight-bold">Created at</p>
		</div>
		<div class="column is-2">
			<p class="is-size-6 has-text-centered has-text-weight-bold">Updated at</p>
		</div>
	{/if}
	<div class="column is-1">
		<p></p>
	</div>
</div>

<style lang="scss">
	.row {
		border-top: 1px solid gray;
		border-bottom: 1px solid gray;
	}
</style>
