<script>
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import CopyToClipboard from '$components/util/CopyToClipboard.svelte';
	import { StacApis, StacCatalogs } from '$lib/config/AppConfig';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
</script>

<section class="body-section p-4">
	<div class="my-2"><BackToPreviousPage defaultLink="/management" /></div>

	<h1 class="title">STAC Management tools</h1>

	<table class="table is-bordered is-striped is-hoverable is-narrow is-fullwidth">
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Type</th>
				<th>STAC Catalog URL</th>
			</tr>
		</thead>
		<tbody>
			{#each StacApis as stac}
				<tr>
					<td>
						<DefaultLink title={stac.id} href="/management/stac/api/{stac.id}" target="" />
					</td>
					<td>{stac.name}</td>
					<td>API</td>
					<td><CopyToClipboard value={stac.url} /></td>
				</tr>
			{/each}

			{#each StacCatalogs as stac}
				<tr>
					<td>
						<DefaultLink title={stac.id} href="/management/stac/catalog/{stac.id}" target="" />
					</td>
					<td>{stac.name}</td>
					<td>Catalog</td>
					<td><CopyToClipboard value={stac.url} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<style lang="scss">
	.body-section {
		min-height: 30vh;
	}
</style>
