<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { Accordion, HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	export let data: PageData;

	let licenses = data.licenses;

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'license', url: $page.url.href }
	];

	const versionInfo = JSON.parse(version);

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="body-section m-6">
	<p class="is-size-6">
		<DefaultLink
			href={versionInfo.homepage}
			title="UNDP GeoHub (v{versionInfo.version})"
			target="_blank"
		/> is being developed and maintained by <b>{versionInfo.author}</b> under
		<b>{versionInfo.license}</b>.
	</p>
	<p class="is-size-6">
		The platform uses the following open source softwares in the frontend side.
	</p>

	{#each Object.keys(licenses) as key}
		{@const licenseList = licenses[key]}
		{@const title = key.replace('(', '').replace(')', '').trim()}
		<Accordion {title} bind:isExpanded={expanded[key]}>
			<div slot="content">
				<p class="is-size-6">
					The following <b>{licenseList.length}</b> package{`${licenseList.length > 1 ? 's' : ''}`} are
					licensed under <b>{title}.</b>
				</p>
				<div class="table-container">
					<table class="map-table table is-hoverable is-fullwidth">
						<thead>
							<tr>
								<th class="is-uppercase">Package name</th>
								<th class="is-uppercase">Version</th>
								<th class="is-uppercase">Author</th>
								<th class="is-uppercase">Homepage</th>
								<th class="is-uppercase">Description</th>
							</tr>
						</thead>
						<tbody>
							{#each licenseList as l}
								<tr>
									<td>{l.name}</td>
									<td>{l.versions.join(', ')}</td>
									<td>
										{#if l.author}
											{l.author}
										{:else}
											N/A
										{/if}
									</td>
									<td><DefaultLink href={l.homepage} title="Homepage" target="_blank" /></td>
									<td>
										{#if l.description}
											<!-- eslint-disable svelte/no-at-html-tags -->
											{@html marked.parse(l.description)}
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</Accordion>
	{/each}
</section>
