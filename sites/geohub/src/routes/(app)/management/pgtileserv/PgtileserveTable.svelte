<script lang="ts">
	import { generateHashKey } from '$lib/helper';
	import type { DatasetFeatureCollection, PgtileservLayer } from '$lib/types';

	interface ManagedPgtileservLayer extends PgtileservLayer {
		url: string;
		key: string;
	}

	interface Props {
		layers: ManagedPgtileservLayer[];
		datasets: DatasetFeatureCollection | undefined;
	}

	let { layers = $bindable([]), datasets = $bindable(undefined) }: Props = $props();

	let hideRegistered = $state(true);
	let skipCols = ['type', 'name', 'schema', 'url', 'key'];

	const getPublishLink = (data: ManagedPgtileservLayer) => {
		const dataset = datasets.features.find((ds) => ds.properties.id === data.key);
		if (dataset) {
			return dataset.properties.links.find((l) => l.rel === 'dataset').href;
		} else {
			return `/data/${generateHashKey(data.url)}/edit?url=${data.url}`;
		}
	};
</script>

<div class="my-4">
	<label class="checkbox">
		<input type="checkbox" bind:checked={hideRegistered} />
		Hide registered datasets
	</label>
</div>

<div class="table-container">
	<table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
		<thead>
			<tr>
				<th>No.</th>
				{#each Object.keys(layers[0]) as col (col)}
					{#if !skipCols.includes(col)}
						<th>
							{col}
						</th>
					{/if}
				{/each}
				<th>registered</th>
			</tr>
		</thead>
		<tbody>
			{#each layers as layer, index (layer.id)}
				{@const publishUrl = getPublishLink(layer)}
				{@const unregistered = publishUrl.startsWith('/data')}
				{#if !(hideRegistered && !unregistered)}
					<tr>
						<td>{index + 1}</td>
						{#each Object.keys(layer) as col (col)}
							{#if !skipCols.includes(col)}
								<td>
									{#if col === 'detailurl'}
										<a href={layer[col]} target="_blank">pgtilserv detail</a>
									{:else}
										{layer[col]}
									{/if}
								</td>
							{/if}
						{/each}
						<td>
							{#if unregistered}
								<a href={publishUrl} target="_blank">Register now!</a>
							{:else}
								<a href={publishUrl} target="_blank">Registered</a>
							{/if}
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th>No.</th>
				{#each Object.keys(layers[0]) as col (col)}
					{#if !skipCols.includes(col)}
						<th>{col}</th>
					{/if}
				{/each}
				<th>registered</th>
			</tr>
		</tfoot>
	</table>
</div>
