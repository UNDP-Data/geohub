<script lang="ts">
	import { AccepedExtensions } from '$lib/config/AppConfig';

	let archiveFormat = AccepedExtensions.find((ext) => ext.name === 'Archive Formats');
</script>

<div class="p-5">
	<div class="block">
		<p class="title is-3 has-text-centered">Supported Formats</p>
	</div>
	<div class="block">
		GeoHub supports many file formats that are supported by <a href="https://gdal.org">GDAL</a>
		These file formats can be supplied in their original formats or as archives as
		{#each archiveFormat.extensions as ext}
			<span class="is-info is-light tag is-medium mx-1">
				.{ext}
			</span>
		{/each}
		The full list of all supported files is listed below
	</div>
	<div class="columns">
		{#each ['raster', 'vector'] as type}
			<div class="column block">
				<p class="is-capitalized has-text-weight-bold is-size-4">{type} Formats Supported</p>
				<div class="table-container has-content-centered mt-5">
					<table class="table is-striped is-narrow is-hoverable is-fullwidth">
						<thead class="table-header">
							<tr>
								<th>Name</th>
								<th>Extensions</th>
							</tr>
						</thead>
						<tbody>
							{#each AccepedExtensions as item}
								{#if item.dataTypes.includes(type)}
									<tr>
										<td><a href={item.href}>{item.name}</a></td>
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
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
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
