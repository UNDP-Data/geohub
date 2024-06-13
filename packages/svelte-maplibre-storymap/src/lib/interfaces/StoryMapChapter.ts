import type { ControlPosition, StyleSpecification } from 'maplibre-gl';

export interface StoryMapChapterLayerEvent {
	/**
	 * Layer name as assigned in MapLibre style.
	 */
	layer: string;
	/**
	 * The opacity to display the layer. 0 is fully transparent, 1 is fully opaque.
	 */
	opacity: number;
	/**
	 * The length of the opacity transition, numeric, in milliseconds. Default is 300. This is an optional parameter and can be omitted.
	 */
	duration?: number;
}

export interface StoryMapChapter {
	/**
	 * A slug-style ID for the chapter. This is read by the JavaScript driving the app and is assigned as an HTML id for the div element containing the rest of the story. A best-practice format would be to use kebab case, like my-story-chapter-1
	 */
	id: string;

	/**
	 * The title of the section, displayed in an h3 element.
	 */
	title?: string;

	/**
	 * The main story content for the section.
	 * This should be aligned with what the reader is seeing on the map.
	 * In the vanilla version, this field will render as HTML. Images, links, and other items can be included as HTML.
	 *
	 * This should be written by markdown format. `marked` library will be used to convert this string to HTML.
	 * See marked library documentation at https://www.npmjs.com/package/marked
	 */
	description?: string;

	/**
	 * This defines where the story text should appear over the map. Options are center, left, right, and full. When the browser window is less than 750 pixels wide, the story will be center aligned.
	 */
	alignment?: 'center' | 'left' | 'right' | 'full';

	/**
	 * Sets the visibility of the chapter to hidden when true. The chapter will still trigger a map and layer transition.
	 */
	hidden?: boolean;

	/**
	 * When set to true, sets this chapter to be interactive, allowing the user to pan and zoom across the map, and adds navigation controls.
	 */
	mapInteractive?: boolean;

	/**
	 * Navigation control's position. Default is 'top-right'
	 */
	mapNavigationPosition?: ControlPosition;

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
	mapAnimation?: 'flyTo' | 'easeTo' | 'jumpTo';
	/**
	 * Starts a slow rotation animation at the end of the map transition when set to true. The map will rotate 90 degrees over 24 seconds.
	 */
	rotateAnimation?: boolean;

	/**
	 * Start spinning globe anitation. The map will rotate 360 degrees over 20 seconds.
	 */
	spinGlobe?: boolean;

	/**
	 * Use different style for the chapter from main one if it is set.
	 */
	style?: StyleSpecification | string;

	/**
	 * Layers to be displayed/hidden/muted when the section becomes active. Array of objects
	 */
	onChapterEnter?: StoryMapChapterLayerEvent[];

	/**
	 * Same as onChapterEnter except it is triggered when the section becomes inactive. Array of objects
	 */
	onChapterExit?: StoryMapChapterLayerEvent[];
}
