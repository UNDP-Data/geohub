<script lang="ts">
	import { AccepedExtensions } from '$lib/config/AppConfig';
</script>

<p class="title is-4 has-text-centered mt-5">Supported Formats</p>
<div class="table-container mt-5">
	<table class="table fullwidth-table ml-auto mr-auto small striped">
		<thead class="table-header">
			<tr>
				<th>Name</th>
				<th>extensions</th>
			</tr>
		</thead>
		<tbody>
			{#each AccepedExtensions as item}
				<tr>
					<td><a href={item.href}>{item.name}</a></td>
					<td>{item.extensions}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.table-container {
		//max-height: 600px;
		overflow-y: auto;
		.fullwidth-table {
			width: 100%;
		}
	}
</style>
