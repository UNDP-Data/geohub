import { writable } from 'svelte/store';

/**
 * Create customised store for websocket instance
 * @returns store object
 */
function createWebsocketStore() {
	const { set, update, subscribe } = writable<WebSocket>(undefined);

	/**
	 * Add on message event listener
	 * @param callback
	 */
	const addOnMessageEvent = (callback: (event: MessageEvent) => void) => {
		update((state) => {
			state.addEventListener('message', callback);
			return state;
		});
	};

	/**
	 * remove on message event listener
	 * @param callback
	 */
	const removeOnMessageEvent = (callback: (event: MessageEvent) => void) => {
		update((state) => {
			state.removeEventListener('message', callback);
			return state;
		});
	};

	return {
		subscribe,
		update,
		set,
		addOnMessageEvent,
		removeOnMessageEvent
	};
}

/**
 * Websocket instance store
 */
export const websocket = createWebsocketStore();

/**
 * Estalish websocket connection to the server
 * @param url URL object of the website. It is available from $page.url in sveltekit.
 * @returns returns websocket instance once the connection become opened.
 */
export const establishWebsocket = (url: URL) => {
	return new Promise<WebSocket>((resolve) => {
		const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
		const ws = new WebSocket(`${protocol}//${url.host}/websocket`);
		ws.addEventListener('open', (event) => {
			console.log('[websocket] connection open', event);
			resolve(ws);
		});
		ws.addEventListener('close', (event) => {
			console.log('[websocket] connection closed', event);
		});
	});
};
