import api from '$api';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = (event: RequestEvent) => api.handle(event);
