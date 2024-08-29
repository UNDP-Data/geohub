<script lang="ts">
	export let dataErrors: { index: number; error }[];
</script>

<p>Errors were found while parsing your file</p>
<ul style="max-height: 500px; overflow-y: scroll;">
	{#each dataErrors as err}
		{@const errList = err.error.message.split('. ')}
		<li>
			{#if errList.length <= 1}
				Row {err.index}: {err.error.message}
			{:else}
				<div>Row {err.index}:</div>
				<ul>
					{#each errList as errItem}
						<li>- {errItem}</li>
					{/each}
				</ul>
			{/if}
		</li>
	{/each}
</ul>
