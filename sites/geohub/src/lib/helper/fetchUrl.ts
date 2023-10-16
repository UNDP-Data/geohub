import { FetchTimeoutMsec } from '$lib/config/AppConfig';
import { fetchWithTimeout } from './fetchWithTimeout';

/**
 * Returns a json response object from the a fetch of a url
 * @param url The URL to fetch
 * @returns JSON | null
 */
export async function fetchUrl(url: string) {
	return new Promise<Response>((resolve, reject) => {
		fetchWithTimeout(url, { timeout: FetchTimeoutMsec })
			.then((res) => res.json())
			.then((json) => {
				resolve(json);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
