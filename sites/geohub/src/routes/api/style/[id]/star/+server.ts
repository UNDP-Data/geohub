import api from '$api';
import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = (event: RequestEvent) => api.handle(event);
export const DELETE: RequestHandler = (event: RequestEvent) => api.handle(event);
