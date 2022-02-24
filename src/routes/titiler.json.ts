import { TITILER_ENDPOINT } from '$lib/variables';

export async function get() {
    return {
        body: {
            TITILER_ENDPOINT: TITILER_ENDPOINT
        }
    };
}