import type { PageServerLoad } from './$types';
import type { DatasetFeatureCollection, IngestingDataset, Tag } from '$lib/types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { TagSearchKeys } from '$lib/config/AppConfig';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	const { locals, url, parent } = event;
	const session = await locals.getSession();

	let wssUrl = '';
	if (session) {
		const serviceClient = new WebPubSubServiceClient(env.AZURE_PUBSUB_CONNECTIONSTRING, 'Hub');
		const token = await serviceClient.getClientAccessToken({
			userId: session.user.id,
			roles: ['webpubsub.sendToGroup.datapipeline', 'webpubsub.joinLeaveGroup.datapipeline']
		});
		wssUrl = token.url;
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

	return {
		wssUrl,
		promises: {
			datasets: getDatasets(event.fetch, apiUrl),
			ingestingDatasets: session
				? getIngestingDatasets(event.fetch, ingestingsortby, ingestingsortorder)
				: undefined,
			tags: getTags(event.fetch, new URL(`${url.origin}/api/datasets${apiUrl.search}`))
		}
	};
};

const getDatasets = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`/api/datasets${url.search}`);
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

const getTags = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	url.searchParams.delete('style');
	const apiUrl = `${url.origin}/api/tags?url=${encodeURIComponent(url.toString())}`;
	const res = await fetch(apiUrl);
	const json: { [key: string]: Tag[] } = await res.json();

	const tags: { [key: string]: Tag[] } = {};
	TagSearchKeys.forEach((t) => {
		if (!json[t.key]) return;
		tags[t.key] = json[t.key];
	});
	return tags;
};
