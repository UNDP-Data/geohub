<script lang="ts">
	import { page } from '$app/stores';
	import { AccepedExtensions } from '$lib/config/AppConfig';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';

	let archiveFormat = AccepedExtensions.find((ext) => ext.name === 'Archive Formats');

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'datasets', url: '/data' },
		{ title: 'upload', url: '/data/upload' },
		{ title: 'Supported Format', url: $page.url.href }
	];
</script>

<HeroHeader title="Supported Formats" bind:breadcrumbs />

<div class="mx-6 my-4">
	<div class="block">
		<p class="is-size-5">
			GeoHub supports many file formats that are supported by
			<DefaultLink title="GDAL" href="https://gdal.org" target="_blank" />. The full list of all
			supported files is listed below
		</p>
	</div>

	{#each ['raster', 'vector'] as type}
		<h2 class="title is-2 is-capitalized">{type} Formats Supported</h2>

		<div class="table-container has-content-centered mt-5">
			<table class="table is-striped is-narrow is-hoverable">
				<thead class="table-header">
					<tr>
						<th>Name</th>
						<th>Extensions</th>
					</tr>
				</thead>
				<tbody>
					{#each AccepedExtensions as item}
						{#if item.name !== 'Archive Formats'}
							{#if item.dataTypes.includes(type)}
								<tr>
									<td><DefaultLink title={item.name} href={item.href} target="_blank" /></td>
									<td>
										<div class="extensions">
											{#each item.extensions as ext}
												<span
													class="{item.requiredExtensions?.includes(ext)
														? 'is-danger'
														: item.extensions.includes('shp')
															? 'is-success'
															: 'is-info'} is-light tag is-medium"
												>
													.{ext}
												</span>
											{/each}
										</div>
									</td>
								</tr>
							{/if}
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/each}

	<h2 class="title is-2 is-capitalized">Archived Formats Supported</h2>

	<div class="block">
		<p class="is-size-5">
			These file formats listed in the above sections can be supplied in their original formats or
			as archives as
			{#each archiveFormat.extensions as ext}
				<span class="is-info is-light tag is-medium ml-1">
					.{ext}
				</span>
			{/each}
		</p>
	</div>

	<hr />
	<div class="block">
		<ul>
			<li class="my-1">
				<span class="is-info is-light tag is-medium">.extension</span> : Possible extension for corresponding
				data format
			</li>
			<li class="my-1">
				<span class="is-danger is-light tag is-medium">.extension</span> : Required extension for Shapefile
			</li>
			<li class="my-1">
				<span class="is-success is-light tag is-medium">.extension</span> : Optional Extension for Shapefile
			</li>
		</ul>
	</div>
</div>

<style lang="scss">
	.extensions {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.4rem;
	}
</style>
