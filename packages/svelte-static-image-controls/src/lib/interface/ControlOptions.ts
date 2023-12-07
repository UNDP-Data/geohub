import type { ImageApiTypes } from './ImageApiTypes.ts';
import type { PageOrientation } from './PageOrientation.js';

export interface ControlOptions {
	width?: number;
	height?: number;
	bbox?: [number, number, number, number];
	latitude?: number;
	longitude?: number;
	zoom?: number;
	bearing?: number;
	pitch?: number;
	ratio?: number;
	defaultApi?: ImageApiTypes;
	extension?: string;
	pageSize?: string;
	orientation?: PageOrientation;
}
