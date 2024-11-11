import type { StyleSpecification } from 'maplibre-gl';
import type { StoryMapChapter } from './StoryMapChapter.js';

export interface StoryMapConfig {
	/**
	 * Maplibre style object or URL string for Maplibre style
	 */
	style: StyleSpecification | string;

	/**
	 * The title of the overall story. (Optional)
	 */
	title?: string;

	/**
	 * Add a logo image data URI string to the header of your story. (Optional)
	 */
	logo?: string;

	/**
	 * A subtitle for the story. (Optional)
	 */
	subtitle?: string;

	/**
	 * Credit the author of the story. (Optional)
	 */
	byline?: string;

	/**
	 * Citations, credits, etc. that will be displayed at the bottom of the story.
	 */
	footer?: string;

	/**
	 * This contains all of the story content and map controls for each section of the story. Array of objects
	 */
	chapters: StoryMapChapter[];

	/**
	 * If true, slide progress bar is shown at the right hand side of storymap. Default is true.
	 */
	showProgress: boolean;

	/**
	 * Details about the map display and camera view.
	 */
	location: {
		/**
		 * Center coordinates of the map, as longitude, latitude
		 */
		center: [number, number];
		/**
		 * Zoom level of the map.
		 */
		zoom: number;
		/**
		 * Angle of the map view. 0 is straight down, and 60 is highly tilted.
		 */
		pitch?: number;
		/**
		 * Degrees of rotation clockwise from North (0). Negative values represent counter-clockwise rotation.
		 */
		bearing?: number;
	};
}
