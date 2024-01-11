<script lang="ts">
	import Help from '$components/util/Help.svelte';
	export let title: string;
	export let showHelp = true;
</script>

<div class="field">
	<label class="label is-normal is-flex is-align-items-center is-capitalized">
		{title}
		{#if showHelp}
			<div class="ml-2 help">
				<Help>
					<slot name="help" />
				</Help>
			</div>
		{/if}
	</label>
	<div class="control">
		<slot name="control" />
	</div>
</div>
