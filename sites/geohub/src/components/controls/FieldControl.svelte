<script lang="ts">
	import Help from '$components/Help.svelte';
	export let title: string;
</script>

<div class="field">
	<label class="label is-normal is-flex">
		{title}
		<div class="help">
			<Help>
				<slot name="help" />
			</Help>
		</div>
	</label>
	<div class="control">
		<slot name="control" />
	</div>
</div>

<style lang="scss">
	.help {
		margin-left: auto;
	}
</style>
