declare module 'svelte-carousel' {
	import { SvelteComponentTyped } from 'svelte';

	interface CarouselProps {
		arrows?: boolean = true; //Enables next/prev arrows
		infinite?: boolean = true; //Infinite looping
		initialPageIndex?: number = 0; //Page to start on
		duration?: number = 500; //Transition duration (ms)
		autoplay?: boolean = false; //Enables autoplay of pages
		autoplayDuration?: number = 3000; // Autoplay change interval (ms)
		autoplayDirection?: 'next' | 'prev' = 'next'; // Autoplay change direction (next or prev)
		pauseOnFocus?: boolean = false; //	Pauses on focus (for touchable devices - tap the carousel to toggle the autoplay, for non-touchable devices - hover over the carousel to pause the autoplay)
		autoplayProgressVisible?: boolean = false; //Shows autoplay duration progress indicator
		dots?: boolean = true; //	Current indicator dots
		timingFunction?: string = 'ease-in-out'; //CSS animation timing function
		swiping?: boolean = true; //	swiping
		particlesToShow?: number = 1; // Number elements to show
		particlesToScroll?: number = 1; //Number of elements to scroll
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
