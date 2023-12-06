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
			content: `You can explore datasets from <b>Data</b> tab. Let's start looking how you can search the datasets!`,
			target: '.tab-data',
			order: 3
		},
		{
			title: 'Explore by shortcuts',
			content: `
            You can find datasets from the shortcuts' menu.
            <br><br>
            <b>SDG</b>: You can search datasets by Sustainable Development Goal (SDG)
            <br>
            <b>Continent</b>: You can search datasets from continent > selected country
            <br>
            Note. Currently, most of our datasets are global data, that means you may be able to find less data if you explore by a country.
            <br>
            <b>Microsoft Planetary</b>: Satellite imagery powered by Microsoft Planetary Computer is also available from this shortcut menu.
            <br>
            <b>Dynamic vector data</b>: The datasets under this category enables you to dynamically change the parameters to simulate the datasets for advanced analysis.
            <br>
            <b>Organisations</b>: If you click a logo of institution like UNDP, UNICEF, etc., you can find datasets come from that organisation.
            `,
			target: '.data-view-container',
			order: 4
		},
		{
			title: 'Search datasets by keywords',
			content: `You can search datasets by typing keywords in this searching window. The results will be shown at the below of searching window. Open a accordion of a dataset to find more detailed metadata, then add the dataset to the map for further analysis`,
			target: '.search-field',
			order: 5
		},
		{
			title: 'Switch to Layers tab',
			content: `
            Once you add a dataset to the map, you can switch it to <b>Layers</b> tab to see other menu to style and analyse the dataset.
            <br>
            This layer panel provides you full functionality of visualing and analysing the dataset.
            <br>
            <ul>
                <li><b>Legend tab</b>: You can change layer style. Switch to <b>Classify</b> tab to change colormap or property to visualise.</li>
                <li><b>Filter tab</b>: You can filter the dataset by attribute data</li>
                <li><b>Label tab</b>: You can also add the data label to the map from this tab</li>
                <li><b>Opacity tab</b>: The layer opacity can be changed from here</li>
                <li><b>Simulation tab</b>: You can dynamically change parameters to simulate this dataset on this tab</li>
            </ul>
            `,
			target: '.tab-layers',
			order: 6
		},
		{
			title: 'Map operations',
			content: `
            From this step, we are going to show you main operations on the map.
            `,
			target: '.map',
			order: 7
		},
		{
			title: 'Switching basemap',
			content: `
            You can toggle this button to switch basemap either OpenStreetMap or Bing Aerial
            `,
			target: '.maplibregl-style-switcher-control',
			order: 8
		},
		{
			title: 'Show/hide sidebar',
			content: `
            You can show or hide sidebar container by toggling this button.
            `,
			target: '.split-container .close-icon',
			order: 9
		},
		{
			title: 'Querying the information',
			content: `
            If this tool is enabled, you can query the information by clicking any position on the map. A popup will be shown for further detailed information.
            `,
			target: '.maplibregl-ctrl-query',
			order: 10
		},
		{
			title: 'Save your work to share with your colleagues',
			content: `
            Once you sign in to your account, this button will be enabled. You can save your current work to share it with your colleagues.
            `,
			target: '.maplibregl-ctrl-styleshare',
			order: 11
		},
		{
			title: 'Exporting map image',
			content: `
            You can export the current map image with your preferences such as paper size, orientation, file format, etc.
            `,
			target: '.legend-button',
			order: 12
		},
		{
			title: 'Disable hillshade layer',
			content: `
            As default, a hillshade layer is shown on the basemap. You can also disable hillshade layer if you want.
            `,
			target: '.maplibregl-ctrl-hillshade-visibility',
			order: 13
		},
		{
			title: 'Positioning your current location',
			content: `
            Your current location will be visible on the map if you enable this GNSS control.
            `,
			target: '.maplibregl-ctrl-geolocate',
			order: 14
		}
	]
};
