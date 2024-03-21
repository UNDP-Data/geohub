<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import type { PageData } from './$types';

	export let data: PageData;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'license', url: $page.url.href }
	];

	const columns = [
		{
			id: 'name',
			title: 'package name'
		},
		{
			id: 'installedVersion',
			title: 'version'
		},
		{
			id: 'licenseType',
			title: 'license'
		},
		{
			id: 'author',
			title: 'author'
		},
		{
			id: 'link',
			title: 'link'
		}
	];

	const versionInfo = JSON.parse(version);
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="body-section ml-6 mr-4 my-4">
	<h6 class="title is-6">The following open source software is used by UNDP GeoHub.</h6>

	<div class="table-container">
		<table class="map-table table is-hoverable is-fullwidth">
			<thead>
				<tr>
					{#each columns as col}
						<th class="is-uppercase">{col.title}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>GeoHub</td>
					<td>{versionInfo.version}</td>
					<td>{versionInfo.license}</td>
					<td>{versionInfo.author}</td>
					<td>
						<DefaultLink href={versionInfo.homepage} title={versionInfo.homepage} target="_blank" />
					</td>
				</tr>

				{#each data.licenses as l}
					<tr>
						{#each columns as col}
							{@const url = l[col.id].replace('git+', '').replace('.git', '')}
							{#if col.id === 'link'}
								<td>
									{#if url.startsWith('https')}
										<DefaultLink href={url} title={url} target="_blank" />
									{:else}
										{l[col.id]}
									{/if}
								</td>
							{:else}
								<td>{l[col.id]}</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
