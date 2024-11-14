declare module 'svelte-carousel' {
	import { SvelteComponentTyped } from 'svelte';

	interface CarouselProps {
		arrows?: boolean; //Enables next/prev arrows
		infinite?: boolean; //Infinite looping
		initialPageIndex?: number; //Page to start on
		duration?: number; //Transition duration (ms)
		autoplay?: boolean; //Enables autoplay of pages
		autoplayDuration?: number; // Autoplay change interval (ms)
		autoplayDirection?: 'next' | 'prev'; // Autoplay change direction (next or prev)
		pauseOnFocus?: boolean; //	Pauses on focus (for touchable devices - tap the carousel to toggle the autoplay, for non-touchable devices - hover over the carousel to pause the autoplay)
		autoplayProgressVisible?: boolean; //Shows autoplay duration progress indicator
		dots?: boolean; //	Current indicator dots
		timingFunction?: string; //CSS animation timing function
		swiping?: boolean; //	swiping
		particlesToShow?: number; // Number elements to show
		particlesToScroll?: number; //Number of elements to scroll
	}

	interface PageChangeEvent {
		detail: number;
	}

	interface CarouselEvents {
		pageChange: (event: PageChangeEvent) => void;
	}

	interface CarouselSlots {
		prev: string;
		next: string;
		dots: string;
		default: string;
	}

	export default class Carousel extends SvelteComponentTyped<
		CarouselProps,
		CarouselEvents,
		CarouselSlots
	> {
		goTo: (index: number, options?: { animated?: boolean }) => void;
		goToPrev: (options?: { animated?: boolean }) => void;
		goToNext: (options?: { animated?: boolean }) => void;
	}
}
