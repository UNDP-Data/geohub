import type { PageServerLoad } from './$types';
import type { DatasetFeatureCollection, IngestingDataset, Tag } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { TagSearchKeys } from '$lib/config/AppConfig';

export const load: PageServerLoad = async (event) => {
	const { locals, url, parent } = event;
	const session = await locals.getSession();
	// if (!session) return {};

	const parentData = await parent();
	const config: UserConfig = parentData.config;

	const apiUrl = new URL(url);

	// reset default query params if it is not in queryparams
	const queryoperator = url.searchParams.get('queryoperator');
	if (!queryoperator) {
		apiUrl.searchParams.set('queryoperator', config.DatasetSearchQueryOperator);
	}
	const operator = url.searchParams.get('operator');
	if (!operator) {
		apiUrl.searchParams.set('operator', config.TagSearchOperator);
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

	if (apiUrl.search !== url.search) {
		throw redirect(300, `${apiUrl.pathname}${apiUrl.search}`);
	}

	// only azure's user data is avalable for data page
	// apiUrl.searchParams.set('type', 'azure');
	// only allow user owned data is available for data page
	// apiUrl.searchParams.set('mydata', 'true');

	return {
		promises: {
			datasets: getDatasets(event.fetch, apiUrl),
			ingestingDatasets: session ? getIngestingDatasets(event.fetch) : undefined,
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
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
	const resIngesting = await fetch(`/api/datasets/ingesting`);
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
