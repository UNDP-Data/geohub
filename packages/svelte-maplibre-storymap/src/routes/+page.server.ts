import type { StoryMapConfig } from '$lib/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const config: StoryMapConfig = {
		style: 'https://dev.undpgeohub.org/api/mapstyle/style.json',
		title: 'Maplibre story map demo',
		logo: 'https://dev.undpgeohub.org/assets/undp-images/undp-logo-blue.svg',
		subtitle: 'Subtitle of storymap',
		byline: 'Jin Igarashi',
		footer: 'United Nations Development Programme',
		chapters: [
			{
				id: 'kenya',
				title: 'Kenya',
				description: `
#### Kenya
This is the Republic of **Kenya**.

![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/128px-Flag_of_Kenya.svg.png)

Read more about this country [here](https://en.wikipedia.org/wiki/Kenya).
				`,
				alignment: 'left',
				mapInteractive: false,
				location: {
					center: [35.446, -0.12],
					zoom: 6,
					bearing: 0,
					pitch: 0
				},
				mapAnimation: 'flyTo',
				rotateAnimation: false,
				spinGlobe: true,
				hidden: false
			},
			{
				id: 'rwanda',
				title: 'Rwanda',
				description: 'This is the Republic of Rwanda',
				alignment: 'right',
				mapInteractive: true,
				mapNavigationPosition: 'bottom-right',
				location: {
					center: [29.601, -1.784],
					zoom: 8,
					bearing: 0,
					pitch: 0
				},
				mapAnimation: 'flyTo',
				rotateAnimation: false,
				spinGlobe: false,
				hidden: false,
				style: 'https://dev.undpgeohub.org/api/style/291.json'
			},
			{
				id: 'ceei',
				title: 'Clean Energy Equity Index (CEEI)',
				description:
					'The clean energy equity index (CEEI) is a composite index measuring current progress towards an equitable carbon neutral future of New York State that includes three objectives: toward clean energy equity, clean energy potential, and urgency to clean energy transition. This is the first draft showcase version. We may add or drop several indicators in the near future, which may affect the final index values.',
				alignment: 'center',
				mapInteractive: false,
				location: {
					center: [-74.501, 42.809],
					zoom: 6.35,
					bearing: 0,
					pitch: 0
				},
				mapAnimation: 'flyTo',
				rotateAnimation: false,
				spinGlobe: false,
				hidden: false,
				style: 'https://dev.undpgeohub.org/api/style/304.json'
			},
			{
				id: 'dynamic-hdi',
				title: 'Dynamic Subnational HDI',
				description: 'This is dynamic subnational HDI, please insert the desired increment values',
				alignment: 'right',
				mapInteractive: false,
				location: {
					center: [19.29, -2.52],
					zoom: 2.77,
					bearing: 21.6,
					pitch: 64
				},
				mapAnimation: 'flyTo',
				rotateAnimation: true,
				spinGlobe: false,
				hidden: false,
				style: 'https://dev.undpgeohub.org/api/style/274.json'
			},
			{
				id: 'japan',
				title: 'Japan',
				description: 'This is Japan',
				alignment: 'full',
				mapInteractive: false,
				location: {
					center: [136.34, 37.5],
					zoom: 4,
					bearing: 0,
					pitch: 0
				},
				mapAnimation: 'flyTo',
				spinGlobe: false,
				rotateAnimation: true,
				hidden: false
			},
			{
				id: 'beijing',
				title: 'Beijing',
				description: 'This is Beijing, China',
				alignment: 'right',
				mapInteractive: true,
				location: {
					center: [116.3379, 39.8827],
					zoom: 10,
					bearing: 0,
					pitch: 0
				},
				mapAnimation: 'flyTo',
				spinGlobe: false,
				rotateAnimation: true,
				hidden: false
			}
		]
	};

	return {
		config
	};
};
