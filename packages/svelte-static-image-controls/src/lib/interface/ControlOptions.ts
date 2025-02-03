import type { ImageApiTypes } from './ImageApiTypes';
import type { PageOrientation } from './PageOrientation';

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
