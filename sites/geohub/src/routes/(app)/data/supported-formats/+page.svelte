<script lang="ts">
	import { AccepedExtensions } from '$lib/config/AppConfig';
</script>

<div class="column is-fluid">
	<div class="block">
		<p class="title is-4 has-text-centered">Supported Formats</p>
	</div>
	<div class="block">
		GeoHub supports many file formats that are supported by <a href="https://gdal.org">GDAL</a>
		These file formats can be supplied in their original formats or as archives as
		<code>.zip</code>
		<code>.tar</code>
		<code>.gz</code>
		<code>tar.gz</code>
		<code>.7z</code>
		The full list of all supported files is listed below
	</div>
	<div class="columns">
		<div class="column block">
			<b>Raster Formats Supported</b>
			<div class="table-container has-content-centered mt-5">
				<table class="table mr-auto">
					<thead class="table-header">
						<tr>
							<th>Name</th>
							<th>extensions</th>
						</tr>
					</thead>
					<tbody>
						{#each AccepedExtensions as item}
							{#if item.dataTypes.includes('raster')}
								<tr>
									<td><a href={item.href.replace('vector', 'raster')}>{item.name}</a></td>
									<td>
										{#each item.extensions as ext}
											<span class="ml-2 is-info is-light tag">
												{ext}
											</span>
										{/each}
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div class="column block">
			<b>Vector Formats Supported</b>
			<div class="table-container has-content-centered mt-5">
				<table class="table mr-auto">
					<thead class="table-header">
						<tr>
							<th>Name</th>
							<th>extensions</th>
						</tr>
					</thead>
					<tbody>
						{#each AccepedExtensions as item}
							{#if item.dataTypes.includes('vector')}
								<tr>
									<td><a href={item.href}>{item.name}</a></td>
									{#if item.extensions.includes('shp')}
										<td>
											{#each item.extensions as ext}
												<span
													class="ml-2 {item.requiredExtensions.includes(ext)
														? 'is-danger'
														: 'is-info'} is-light tag"
												>
													{ext}
												</span>
											{/each}
										</td>
									{:else}
										<td>
											{#each item.extensions as ext}
												<span class="ml-2 is-info is-light tag">
													{ext}
												</span>
											{/each}
										</td>
									{/if}
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
</style>
