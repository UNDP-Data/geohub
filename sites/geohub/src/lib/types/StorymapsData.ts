import type { Link } from './Link';
import type { Pages } from './Pages';
import type { StoryMapConfig } from './Storymap';

export interface StorymapsData {
	stories: StoryMapConfig[];
	links: Link[];
	pages: Pages;
}
