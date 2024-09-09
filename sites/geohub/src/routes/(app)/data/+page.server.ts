import type { PageServerLoad } from './$types';
import type { IngestingDataset } from '$lib/types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { env } from '$env/dynamic/private';

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

	const offset = url.searchParams.get('offset');
	if (!offset) {
		apiUrl.searchParams.set('offset', `0`);
	}

	const ingestingsortby =
		url.searchParams.get('ingestingsortby') ?? config.DataPageIngestingSortingColumn;
	const ingestingsortorder =
		url.searchParams.get('ingestingsortorder') ?? config.DataPageIngestingSortingOrder;

	depends('data:ingestingDatasets');

	const title = 'Data | GeoHub';
	const content = 'Data Portal';

	return {
		title,
		content,
		wss,
		ingestingDatasets: session
			? await getIngestingDatasets(event.fetch, ingestingsortby, ingestingsortorder)
			: undefined
	};
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
