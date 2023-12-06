import type { ImageApiTypes } from './ImageApiTypes.ts';

export interface ControlOptions {
	width?: number;
	height?: number;
	bbox?: [number, number, number, number];
	latitude?: number;
	longitude?: number;
	zoom?: number;
	bearing?: number;
	pitch?: number;
	retina?: boolean;
	defaultApi?: ImageApiTypes;
	extension?: string;
	pageSize?: string;
	dpi?: number;
}
