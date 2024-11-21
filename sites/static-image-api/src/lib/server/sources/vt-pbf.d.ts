// vt-pbf.d.ts
declare module 'vt-pbf' {
	import { Feature, Geometry } from 'geojson';

	/**
	 * Encodes GeoJSON-like data into a Vector Tile Protocol Buffer (vt-pbf) format.
	 * @param tileLayers - An object where keys are layer names and values are arrays of features.
	 * @param options - Encoding options for vector tiles.
	 * @returns A Buffer containing the encoded vector tile data.
	 */
	export function fromGeojsonVt(
		tileLayers: Record<string, GeoJSONVTData>,
		options?: VTEncodeOptions
	): Buffer;

	/**
	 * Options for encoding vector tiles.
	 */
	export interface VTEncodeOptions {
		/**
		 * Version of the vector tile specification (default is 2).
		 */
		version?: number;
	}

	/**
	 * GeoJSONVT-like tile data structure for a single layer.
	 */
	export interface GeoJSONVTData {
		/**
		 * Array of features in the tile.
		 */
		features: GeoJSONVTFeature[];

		/**
		 * Total number of points in the tile.
		 */
		numPoints: number;

		/**
		 * Number of simplified points in the tile.
		 */
		numSimplified: number;

		/**
		 * Total number of features in the tile.
		 */
		numFeatures: number;

		/**
		 * Original source data for the tile.
		 */
		source: Feature<Geometry, GeoJSONProperties>[];

		/**
		 * Tile x-coordinate.
		 */
		x: number;

		/**
		 * Tile y-coordinate.
		 */
		y: number;

		/**
		 * Tile z-coordinate (zoom level).
		 */
		z: number;

		/**
		 * Indicates if the data has been transformed to tile coordinates.
		 */
		transformed: boolean;

		/**
		 * Minimum x-coordinate of the tile.
		 */
		minX: number;

		/**
		 * Minimum y-coordinate of the tile.
		 */
		minY: number;

		/**
		 * Maximum x-coordinate of the tile.
		 */
		maxX: number;

		/**
		 * Maximum y-coordinate of the tile.
		 */
		maxY: number;
	}

	/**
	 * Represents a single feature in a GeoJSONVT layer.
	 */
	export interface GeoJSONVTFeature {
		/**
		 * Type of the geometry (1 = Point, 2 = LineString, 3 = Polygon).
		 */
		type: GeometryType;

		/**
		 * Encoded geometry data.
		 */
		geometry: number[][] | number[][][] | number[][][][];

		/**
		 * Properties associated with the feature.
		 */
		tags: GeoJSONProperties;

		/**
		 * Optional unique ID for the feature.
		 */
		id?: number | string;
	}

	/**
	 * Geometry types for vector tiles.
	 * Matches GeoJSON geometry types, but encoded as integers.
	 */
	export type GeometryType = 1 | 2 | 3; // 1 = Point, 2 = LineString, 3 = Polygon

	/**
	 * Properties in a GeoJSON feature.
	 * Matches the GeoJSON standard for properties.
	 */
	export type GeoJSONProperties = Record<string, string | number | boolean | null>;
}
