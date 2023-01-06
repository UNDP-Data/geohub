import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { BlobServiceAccountManager, DatabaseManager, Datasets, Storages } from '../../util';

const { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY, DATABASE_CONNECTION, TITILER_ENDPOINT } =
	process.env;

const blobRegister: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	context.log('HTTP trigger function processed a request.');
	const url = req.query.url || (req.body && req.body.url);

	if (
		!AZURE_STORAGE_ACCOUNT ||
		!AZURE_STORAGE_ACCESS_KEY ||
		!DATABASE_CONNECTION ||
		!TITILER_ENDPOINT
	) {
		context.res = {
			status: 500,
			body: 'Please set environment variables for this function'
		};
	} else {
		if (!url) {
			context.res = {
				status: 400,
				body: 'Please pass a url on the query string or in the request body'
			};
		} else {
			const blobManager = new BlobServiceAccountManager(
				AZURE_STORAGE_ACCOUNT,
				AZURE_STORAGE_ACCESS_KEY,
				TITILER_ENDPOINT
			);

			// scan file to register
			const res = await blobManager.scanBlob(url);
			if (!res.dataset) {
				throw new Error('No dataset to register');
			}
			const storages: Storages = new Storages([res.storage]);
			const datasets = new Datasets([res.dataset]);
			const dbManager = new DatabaseManager(DATABASE_CONNECTION);
			await dbManager.register(storages, datasets);

			context.res = {
				// status: 200, /* Defaults to 200 */
				body: `${url} was registered to GeoHub`
			};
		}
	}
};

export default blobRegister;
