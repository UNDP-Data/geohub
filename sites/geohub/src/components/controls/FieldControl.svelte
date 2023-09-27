<script lang="ts">
	import Help from '$components/Help.svelte';
	export let title: string;
</script>

<div class="field">
	<label class="label is-normal is-flex is-align-items-center">
		{title}
		<div class="ml-2 help">
			<Help>
				<slot name="help" />
			</Help>
		</div>
	</label>
	<div class="control">
		<slot name="control" />
	</div>
</div>
