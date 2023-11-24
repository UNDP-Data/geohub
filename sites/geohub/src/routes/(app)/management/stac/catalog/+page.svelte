<script lang="ts">
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import CopyToClipboard from '$components/util/CopyToClipboard.svelte';
	import { StacCatalogs } from '$lib/config/AppConfig';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
</script>

<section class=" p-4">
	<div class="my-2"><BackToPreviousPage defaultLink="/management/stac" /></div>

	<h1 class="title pt-4">STAC Catalog Management tools</h1>

	<table class="table is-bordered is-striped is-hoverable is-fullwidth">
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>STAC Catalog URL</th>
			</tr>
		</thead>
		<tbody>
			{#each StacCatalogs as stac}
				<tr>
					<td>
						<DefaultLink title={stac.id} href="/management/stac/catalog/{stac.id}" target="" />
					</td>
					<td>{stac.name}</td>
					<td><CopyToClipboard value={stac.url} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
