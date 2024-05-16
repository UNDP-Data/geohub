import type { PageServerLoad } from './$types';
import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { url, parent, depends } = event;
	const { session } = await parent();

	const wss = {
		url: '',
		group: env.AZURE_PUBSUB_GROUP_DATA_PIPELINE ?? ''
	};
	if (session && env.AZURE_PUBSUB_CONNECTIONSTRING) {
		const serviceClient = new WebPubSubServiceClient(env.AZURE_PUBSUB_CONNECTIONSTRING, 'Hub');
		const token = await serviceClient.getClientAccessToken({
			userId: session.user.id,
			roles: [`webpubsub.sendToGroup.${wss.group}`, `webpubsub.joinLeaveGroup.${wss.group}`]
		});
		wss.url = token.url;
	}

	const parentData = await parent();
	const config: UserConfig = parentData.config;

	const apiUrl = new URL(url);

	// reset default query params if it is not in queryparams
	const queryoperator = url.searchParams.get('queryoperator');
	if (!queryoperator) {
		apiUrl.searchParams.set('queryoperator', config.DataPageSearchQueryOperator);
	}
	const operator = url.searchParams.get('operator');
	if (!operator) {
		apiUrl.searchParams.set('operator', config.DataPageTagSearchOperator);
	}
	const sortby = url.searchParams.get('sortby');
	if (!sortby) {
		apiUrl.searchParams.set('sortby', config.DataPageSortingColumn);
	}
	const limit = url.searchParams.get('limit');
	if (!limit) {
		apiUrl.searchParams.set('limit', `${config.DataPageSearchLimit}`);
	}

	const offset = url.searchParams.get('offset');
	if (!offset) {
		apiUrl.searchParams.set('offset', `0`);
	}

	const ingestingsortby =
		url.searchParams.get('ingestingsortby') ?? config.DataPageIngestingSortingColumn;
	const ingestingsortorder =
		url.searchParams.get('ingestingsortorder') ?? config.DataPageIngestingSortingOrder;

	depends('data:datasets');
	depends('data:ingestingDatasets');
	return {
		wss,
		datasets: await getDatasets(event.fetch, apiUrl),
		ingestingDatasets: session
			? await getIngestingDatasets(event.fetch, ingestingsortby, ingestingsortorder)
			: undefined
	};
};

const getDatasets = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`/api/datasets${url.search}`);
	if (!res.ok) {
		const json = await res.json();
		error(res.status, json);
	}
	const fc: DatasetFeatureCollection = await res.json();
	return fc;
};

const getIngestingDatasets = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	sortby: string,
	sortorder: string
) => {
	const resIngesting = await fetch(
		`/api/datasets/ingesting?sortby=${sortby}&sortorder=${sortorder}`
	);
	const ingestingDatasets: IngestingDataset[] = await resIngesting.json();
	return ingestingDatasets;
};
