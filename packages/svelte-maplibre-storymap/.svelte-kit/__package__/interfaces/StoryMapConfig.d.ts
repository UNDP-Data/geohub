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
     * Add a logo image to the header of your story. (Optional)
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
}
