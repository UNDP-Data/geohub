import type { TourGuideOptions } from '@watergis/svelte-maplibre-tour';

export const TourOptions: TourGuideOptions = {
	rememberStep: true,
	showStepDots: false,
	steps: [
		{
			title: 'Welcome to UNDP GeoHub!',
			content: `This tutorial is going to take you around the main features of GeoHub to get you on board. <br> Let's begin!`,
			// target: document.body,
			order: 1
		},
		{
			title: 'Sign in',
			content: `If you have an account in UNDP, please sign in to your account from here. So, you will have full functionalities on GeoHub!
            <br>Please continue next step if you are not UNDP staff.`,
			target: '.signin-button',
			order: 2
		},
		{
			title: 'Explore datasets',
			content: `This side bar helps you explore GeoHub datasets and visualise them on the map.`,
			target: '.drawer-content',
			order: 3
		},
		{
			title: 'Data tab',
			content: `You can explore datasets from <b>Data</b> tab. Let's start looking how you can search the datasets!`,
			target: '#tab-Data',
			order: 4
		},
		{
			title: 'Explore by SDG',
			content: `If you are looking for datasets of specific SDG, click this shortcut to exlore them.`,
			target: '.category-SDG',
			order: 5
		},
		{
			title: 'Explore by a region or a country',
			content: `If you are looking for datasets of specific region or country, click this shortcut to exlore them.
            <br><br>
            Note. Currently, most of our datasets are global data, that means you may be able to find less data if you explore by a country.
            `,
			target: '.category-Continent',
			order: 6
		},
		{
			title: 'Explore satellite imagery',
			content: `Satellite imagery powered by Microsoft Planetary Computer is also available from this shortcut menu.`,
			target: '.category-Microsoft-Planetary',
			order: 7
		},
		{
			title: 'Explore dynamic vector data',
			content: `The datasets under this category enables you to dynamically change the parameters to simulate the datasets for advanced analysis.`,
			target: '.category-Dynamic-vector',
			order: 8
		},
		{
			title: 'Explore datasets by intitutions',
			content: `If you click a logo of institution like UNDP, UNICEF, etc., you can find datasets come from that organisation. In this tutorial, you can explore them produced by UNDP.`,
			target: '.category-UNDP',
			order: 9
		},
		{
			title: 'Search datasets by keywords',
			content: `You can search datasets by typing keywords in this searching window. Now, please click outside of this tutorial and type <b>HDI</b> to search datasets. After showing the results, click <b>?</b> button to continue the tutorial.`,
			target: '.filter-text-box',
			order: 10
		},
		{
			title: 'Showing the results',
			content: `Now, the results are shown according to your searching preferences. Close this tutorial, then click an adding button next to <b>Dynamic Subnational HDI</b> to add the dataset into the map. After successfully adding it to the map, click <b>?</b> button to continue the tutorial.`,
			target: '.data-view-container',
			order: 11
		},
		{
			title: 'Switch to Layers tab',
			content: `I believe now you can see the data on the map. Close this tutorial and click to <b>Layers</b> tab to swich to the legend menu. After switching to Layers tab, please come back to this tutorial to continue.`,
			target: '#tab-Layers',
			order: 12
		},
		{
			title: 'Layer legend panel',
			content: `
            This panel provides you full functionality of visualing and analysing the dataset.
            <br>
            <ul>
                <li>Legend tab: You can change layer style. Switch to <b>Classify</b> tab to change colormap or property to visualise.</li>
                <li>Filter tab: You can filter the dataset by attribute data</li>
                <li>Label tab: You can also add the data label to the map from this tab</li>
                <li>Opacity tab: The layer opacity can be changed from here</li>
                <li>Simulation tab: You can dynamically change parameters to simulate this dataset on this tab</li>
            </ul>
            Close this tutorial, try to explore the functionality. Then come back to this tutorial to continue.
            `,
			target: '.vector-layer-container',
			order: 13
		},
		{
			title: 'Map operations',
			content: `
            From this step, we are going to show you main operations on the map.
            `,
			target: '.map',
			order: 14
		},
		{
			title: 'Switching basemap',
			content: `
            You can toggle this button to switch basemap either OpenStreetMap or Bing Aerial
            `,
			target: '.main-switch-container',
			order: 15
		},
		{
			title: 'Querying the information',
			content: `
            If this tool is enabled, you can query the information by clicking any position on the map. A popup will be shown for further detailed information.
            `,
			target: '.maplibregl-ctrl-query',
			order: 16
		},
		{
			title: 'Exporting map image',
			content: `
            You can export the current map image with your preferences such as paper size, orientation, file format, etc.
            `,
			target: '.maplibregl-export-control',
			order: 17
		},
		{
			title: 'Disable hillshade layer',
			content: `
            As default, a hillshade layer is shown on the basemap. You can also disable hillshade layer if you want.
            `,
			target: '.maplibregl-ctrl-hillshade-visibility',
			order: 18
		}
	]
};
