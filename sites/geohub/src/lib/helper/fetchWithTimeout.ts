import { FetchTimeoutMsec } from '$lib/config/AppConfig';

export async function fetchWithTimeout(resource: string, options = { timeout: FetchTimeoutMsec }) {
	return new Promise<Response>((resolve, reject) => {
		const { timeout = FetchTimeoutMsec } = options;
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeout);
		fetch(resource, {
			...options,
			signal: controller.signal
		})
			.then((response) => {
				clearTimeout(id);
				resolve(response);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
