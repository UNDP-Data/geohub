import type { PageServerLoad } from './$types';
import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	const { parent } = event;
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

	const title = 'Data | GeoHub';
	const content = 'Data Portal';

	return {
		title,
		content,
		wss
	};
};
