import { WebPubSubClient } from '@azure/web-pubsub-client';

export const getWebPubSubClient = (url: string, group: string) => {
	const client = new WebPubSubClient(url);
	client.on('connected', async (e) => {
		console.log(`connected. connectionId is ${e.connectionId}`);
	});
	client.on('disconnected', (e) => {
		console.log(`disconnected: connectionId is ${e.connectionId}`);
	});
	client.start().then(() => client.joinGroup(group));
	return client;
};
