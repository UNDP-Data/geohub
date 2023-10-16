import { ServiceBusClient } from '@azure/service-bus';
import { env } from '$env/dynamic/private';

export const sendMessageToServiceBusQueue = async (queueName: string, message: string) => {
	const connectionString = env.AZURE_SERVICE_BUS_CONNECTIONSTRING;
	if (!(connectionString && queueName)) {
		throw new Error(`Connection string for Azure Service Bus is missing`);
	}

	// create a Service Bus client using the connection string to the Service Bus namespace
	const sbClient = new ServiceBusClient(connectionString);

	// createSender() can also be used to create a sender for a topic.
	const sender = sbClient.createSender(queueName);

	try {
		// create a batch object
		const batch = await sender.createMessageBatch();
		batch.tryAddMessage({
			body: message
		});
		await sender.sendMessages(batch);

		console.debug(`A message was sent to ${queueName}, message body: ${message}`);

		// Close the sender
		await sender.close();
	} finally {
		await sbClient.close();
	}
};
